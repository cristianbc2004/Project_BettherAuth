import { z } from "zod";

import { prisma } from "@repo/database";

import { HttpError } from "../../lib/http-error";
import { extractAuditRequestMeta, registerAudit } from "../audit/audit.service";
import { getAuthenticatedUserWithSession } from "../auth/session.service";
import { buildReferenceCode, getInitials, getUserBalances, readIdempotencyKey, toMoneyLabel } from "./bizum.helpers";

const createBizumSchema = z.object({
  action: z.enum(["request", "send"]),
  amount: z.number().finite().positive("The amount must be greater than 0."),
  concept: z.string().trim().max(80, "The concept is too long.").optional().default(""),
  contactUserId: z.string().trim().min(1),
});

export async function getBizumSummary(request: Request) {
  const authenticatedUser = await getAuthenticatedUserWithSession(request);

  if (!authenticatedUser) {
    throw new HttpError(401, "Unauthorized.");
  }

  const [contacts, transfers, balances] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        email: true,
        id: true,
        name: true,
      },
      where: {
        id: {
          not: authenticatedUser.id,
        },
      },
    }),
    prisma.bizumTransfer.findMany({
      include: {
        receiverUser: {
          select: {
            id: true,
            name: true,
          },
        },
        senderUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      where: {
        OR: [{ receiverUserId: authenticatedUser.id }, { senderUserId: authenticatedUser.id }],
      },
    }),
    getUserBalances(authenticatedUser.id),
  ]);

  await prisma.user.update({
    data: {
      totalBalanceCents: balances.totalBalanceCents,
    },
    where: {
      id: authenticatedUser.id,
    },
  });

  const movements = transfers.map((transfer) => {
    const isIncome = transfer.receiverUserId === authenticatedUser.id;
    const counterpart = isIncome ? transfer.senderUser : transfer.receiverUser;
    const signedAmount = isIncome ? `+${toMoneyLabel(transfer.amountCents)}` : `-${toMoneyLabel(transfer.amountCents)}`;

    return {
      amount: signedAmount,
      createdAt: transfer.createdAt.toISOString(),
      id: transfer.id,
      initials: getInitials(counterpart?.name ?? "User"),
      name: counterpart?.name ?? "User",
      tone: isIncome ? "income" : "outcome",
    };
  });

  return {
    availableBalanceCents: balances.availableBalanceCents,
    contacts: contacts.map((contact) => ({
      detail: contact.email,
      id: contact.id,
      initials: getInitials(contact.name),
      name: contact.name,
    })),
    movements,
  };
}

export async function createBizum(request: Request, input: unknown) {
  const auditMeta = extractAuditRequestMeta(request);
  const authenticatedUser = await getAuthenticatedUserWithSession(request);

  if (!authenticatedUser) {
    throw new HttpError(401, "Unauthorized.");
  }

  const result = createBizumSchema.safeParse(input);

  if (!result.success) {
    await registerAudit({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: result.error.issues[0]?.message ?? "Invalid data.",
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: "bizumTransfer",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid data.", result.error.flatten());
  }

  const { action, amount, concept, contactUserId } = result.data;
  const amountCents = Math.round(amount * 100);
  const sendConcept = concept.trim();
  const idempotencyKey = readIdempotencyKey(request);
  const senderBalances = await getUserBalances(authenticatedUser.id);

  if (action === "send" && !idempotencyKey) {
    await registerAudit({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "Missing Idempotency-Key header.",
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: "bizumTransfer",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(400, "Missing Idempotency-Key header.");
  }

  if (contactUserId === authenticatedUser.id) {
    await registerAudit({
      ...auditMeta,
      action: action === "request" ? "BIZUM_REQUEST_CREATE" : "BIZUM_TRANSFER_SEND",
      errorMensaje: "You cannot send Bizum to your own user.",
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: action === "request" ? "bizumRequest" : "bizumTransfer",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(400, "You cannot send Bizum to your own user.");
  }

  const contactUser = await prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
      totalBalanceCents: true,
    },
    where: {
      id: contactUserId,
    },
  });

  if (!contactUser) {
    await registerAudit({
      ...auditMeta,
      action: action === "request" ? "BIZUM_REQUEST_CREATE" : "BIZUM_TRANSFER_SEND",
      errorMensaje: "The selected user does not exist.",
      newvaluePayload: { contactUserId },
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: action === "request" ? "bizumRequest" : "bizumTransfer",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(404, "The selected user does not exist.");
  }

  if (action === "request") {
    const requestConcept = concept.trim();
    const bizumRequest = await prisma.$transaction(async (tx) => {
      const createdRequest = await tx.bizumRequest.create({
        data: {
          amountCents,
          concept: requestConcept || null,
          payerUserId: contactUser.id,
          referenceCode: buildReferenceCode("BQR"),
          requesterUserId: authenticatedUser.id,
        },
        select: {
          amountCents: true,
          id: true,
        },
      });

      const requesterName = authenticatedUser.name.trim() || "A user";
      const amountLabel = toMoneyLabel(amountCents);
      const requestBody = requestConcept
        ? `${requesterName} requests ${amountLabel} from you. Concept: ${requestConcept}`
        : `${requesterName} requests ${amountLabel} from you.`;

      await tx.notification.create({
        data: {
          actionPayload: {
            amountCents,
            amountLabel,
            bizumRequestId: createdRequest.id,
            concept: requestConcept || null,
            requesterUserId: authenticatedUser.id,
          },
          actionRoute: "/notification",
          bizumRequestId: createdRequest.id,
          body: requestBody,
          title: "New Bizum request",
          type: "BIZUM_REQUEST",
          userDestinationId: contactUser.id,
          userEmisorId: authenticatedUser.id,
        },
      });

      return createdRequest;
    });

    await registerAudit({
      ...auditMeta,
      action: "BIZUM_REQUEST_CREATE",
      newvaluePayload: {
        amountCents,
        concept: requestConcept || null,
      },
      sessionId: authenticatedUser.sessionId,
      status: "SUCCESS",
      table: "bizumRequest",
      targetUserId: contactUser.id,
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });

    return {
      availableBalanceCents: senderBalances.availableBalanceCents,
      request: {
        amountCents: bizumRequest.amountCents,
        id: bizumRequest.id,
      },
    };
  }

  const existingTransfer = await prisma.bizumTransfer.findUnique({
    include: {
      receiverUser: {
        select: {
          name: true,
        },
      },
    },
    where: {
      idempotencyKey,
    },
  });

  if (existingTransfer) {
    const existingConcept = existingTransfer.concept?.trim() ?? "";
    const currentConcept = sendConcept || "";
    const isSameOperation =
      existingTransfer.senderUserId === authenticatedUser.id &&
      existingTransfer.receiverUserId === contactUser.id &&
      existingTransfer.amountCents === amountCents &&
      existingConcept === currentConcept;

    if (!isSameOperation) {
      throw new HttpError(409, "The Idempotency-Key was already used with another operation.");
    }

    const refreshedBalances = await getUserBalances(authenticatedUser.id);
    return {
      availableBalanceCents: refreshedBalances.availableBalanceCents,
      transfer: {
        amount: `-${toMoneyLabel(existingTransfer.amountCents)}`,
        createdAt: existingTransfer.createdAt.toISOString(),
        id: existingTransfer.id,
        initials: getInitials(existingTransfer.receiverUser?.name ?? contactUser.name),
        name: existingTransfer.receiverUser?.name ?? contactUser.name,
        tone: "outcome",
      },
    };
  }

  const senderCards = await prisma.target.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      balanceCents: true,
      id: true,
    },
    where: {
      block: false,
      userId: authenticatedUser.id,
    },
  });

  const senderCard = senderCards.find((card) => card.balanceCents >= amountCents);

  if (!senderCard) {
    await registerAudit({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "Insufficient balance to send this Bizum.",
      newvaluePayload: {
        amountCents,
        contactUserId: contactUser.id,
      },
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: "bizumTransfer",
      targetUserId: contactUser.id,
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(400, "Insufficient balance to send this Bizum.");
  }

  const receiverCard = await prisma.target.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
    where: {
      block: false,
      userId: contactUser.id,
    },
  });

  const transfer = await prisma.$transaction(async (tx) => {
    const createdTransfer = await tx.bizumTransfer.create({
      data: {
        amountCents,
        completedAt: new Date(),
        concept: sendConcept || null,
        idempotencyKey,
        receiverCardId: receiverCard?.id ?? null,
        receiverUserId: contactUser.id,
        referenceCode: buildReferenceCode("BTR"),
        senderCardId: senderCard.id,
        senderUserId: authenticatedUser.id,
      },
      include: {
        receiverUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await tx.target.update({
      data: {
        balanceCents: {
          decrement: amountCents,
        },
      },
      where: {
        id: senderCard.id,
      },
    });

    if (receiverCard?.id) {
      await tx.target.update({
        data: {
          balanceCents: {
            increment: amountCents,
          },
        },
        where: {
          id: receiverCard.id,
        },
      });
    }

    const [senderTotalBalance, senderAvailableBalance, receiverTotalBalance] = await Promise.all([
      tx.target.aggregate({
        _sum: { balanceCents: true },
        where: {
          userId: authenticatedUser.id,
        },
      }),
      tx.target.aggregate({
        _sum: { balanceCents: true },
        where: {
          block: false,
          userId: authenticatedUser.id,
        },
      }),
      tx.target.aggregate({
        _sum: { balanceCents: true },
        where: {
          userId: contactUser.id,
        },
      }),
    ]);

    await Promise.all([
      tx.user.update({
        data: {
          totalBalanceCents: senderTotalBalance._sum.balanceCents ?? 0,
        },
        where: {
          id: authenticatedUser.id,
        },
      }),
      tx.user.update({
        data: {
          totalBalanceCents: receiverTotalBalance._sum.balanceCents ?? 0,
        },
        where: {
          id: contactUser.id,
        },
      }),
    ]);

    const senderName = authenticatedUser.name.trim() || "A user";
    const amountLabel = toMoneyLabel(amountCents);
    const sendBody = sendConcept
      ? `${senderName} sent you ${amountLabel}. Concept: ${sendConcept}`
      : `${senderName} sent you ${amountLabel}.`;

    await tx.notification.create({
      data: {
        actionPayload: {
          amountCents,
          amountLabel,
          concept: sendConcept || null,
          senderUserId: authenticatedUser.id,
          transferId: createdTransfer.id,
        },
        actionRoute: "/notification",
        body: sendBody,
        title: "Bizum received",
        transferId: createdTransfer.id,
        type: "BIZUM_RECEIVED",
        userDestinationId: contactUser.id,
        userEmisorId: authenticatedUser.id,
      },
    });

    return {
      transfer: createdTransfer,
      updatedSenderBalanceCents: senderAvailableBalance._sum.balanceCents ?? 0,
    };
  });

  await registerAudit({
    ...auditMeta,
    action: "BIZUM_TRANSFER_SEND",
    newvaluePayload: {
      amountCents,
      concept: sendConcept || null,
      transferId: transfer.transfer.id,
    },
    sessionId: authenticatedUser.sessionId,
    status: "SUCCESS",
    table: "bizumTransfer",
    targetUserId: contactUser.id,
    userId: authenticatedUser.id,
    userName: authenticatedUser.name,
    userRol: authenticatedUser.role,
  });

  return {
    availableBalanceCents: transfer.updatedSenderBalanceCents,
    transfer: {
      amount: `-${toMoneyLabel(transfer.transfer.amountCents)}`,
      createdAt: transfer.transfer.createdAt.toISOString(),
      id: transfer.transfer.id,
      initials: getInitials(transfer.transfer.receiverUser?.name ?? contactUser.name),
      name: transfer.transfer.receiverUser?.name ?? contactUser.name,
      tone: "outcome",
    },
  };
}
