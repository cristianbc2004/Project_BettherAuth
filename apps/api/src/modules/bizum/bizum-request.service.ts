import { prisma } from "@repo/database";

import { HttpError } from "../../lib/http-error";
import { extractAuditRequestMeta, registerAudit } from "../audit/audit.service";
import { getAuthenticatedUserWithSession } from "../auth/session.service";
import { buildReferenceCode, getInitials, getUserBalances, readIdempotencyKey, toMoneyLabel } from "./bizum.helpers";

export async function getBizumRequestDetail(request: Request, id: string) {
  const authenticatedUser = await getAuthenticatedUserWithSession(request);

  if (!authenticatedUser) {
    throw new HttpError(401, "No autorizado.");
  }

  const bizumRequest = await prisma.bizumRequest.findUnique({
    include: {
      requesterUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!bizumRequest || bizumRequest.payerUserId !== authenticatedUser.id) {
    throw new HttpError(404, "Solicitud no encontrada.");
  }

  return {
    amountCents: bizumRequest.amountCents,
    concept: bizumRequest.concept,
    id: bizumRequest.id,
    isPayable:
      !bizumRequest.acceptedAt &&
      !bizumRequest.rejectedAt &&
      !bizumRequest.cancelledAt &&
      !bizumRequest.transferId,
    requester: {
      id: bizumRequest.requesterUser.id,
      initials: getInitials(bizumRequest.requesterUser.name),
      name: bizumRequest.requesterUser.name,
    },
  };
}

export async function payBizumRequest(request: Request, id: string) {
  const auditMeta = extractAuditRequestMeta(request);
  const authenticatedUser = await getAuthenticatedUserWithSession(request);
  const idempotencyKey = readIdempotencyKey(request);

  if (!authenticatedUser) {
    throw new HttpError(401, "No autorizado.");
  }

  if (!idempotencyKey) {
    throw new HttpError(400, "Falta la cabecera Idempotency-Key.");
  }

  const bizumRequest = await prisma.bizumRequest.findUnique({
    include: {
      requesterUser: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!bizumRequest || bizumRequest.payerUserId !== authenticatedUser.id) {
    await registerAudit({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "Solicitud no encontrada.",
      newvaluePayload: { bizumRequestId: id },
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: "bizumRequest",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(404, "Solicitud no encontrada.");
  }

  if (bizumRequest.acceptedAt || bizumRequest.rejectedAt || bizumRequest.cancelledAt || bizumRequest.transferId) {
    await registerAudit({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "La solicitud ya no esta disponible para pago.",
      newvaluePayload: { bizumRequestId: bizumRequest.id },
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: "bizumRequest",
      targetUserId: bizumRequest.requesterUserId,
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(400, "La solicitud ya no esta disponible para pago.");
  }

  const payerCards = await prisma.target.findMany({
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

  const payerCard = payerCards.find((card) => card.balanceCents >= bizumRequest.amountCents);

  if (!payerCard) {
    await registerAudit({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "Saldo insuficiente para pagar la solicitud.",
      newvaluePayload: {
        amountCents: bizumRequest.amountCents,
        bizumRequestId: bizumRequest.id,
      },
      sessionId: authenticatedUser.sessionId,
      status: "FAILED",
      table: "bizumTransfer",
      targetUserId: bizumRequest.requesterUserId,
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    throw new HttpError(400, "Saldo insuficiente para pagar la solicitud.");
  }

  const existingTransfer = await prisma.bizumTransfer.findUnique({
    where: {
      idempotencyKey,
    },
  });

  if (existingTransfer) {
    const existingConcept = existingTransfer.concept?.trim() ?? "";
    const requestConcept = bizumRequest.concept?.trim() ?? "";
    const isSameOperation =
      existingTransfer.senderUserId === authenticatedUser.id &&
      existingTransfer.receiverUserId === bizumRequest.requesterUserId &&
      existingTransfer.amountCents === bizumRequest.amountCents &&
      existingConcept === requestConcept;

    if (!isSameOperation) {
      throw new HttpError(409, "La Idempotency-Key ya fue usada con otra operacion.");
    }

    const payerBalances = await getUserBalances(authenticatedUser.id);
    return {
      availableBalanceCents: payerBalances.availableBalanceCents,
      paidRequestId: bizumRequest.id,
      transferId: existingTransfer.id,
    };
  }

  const requesterCard = await prisma.target.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
    where: {
      block: false,
      userId: bizumRequest.requesterUserId,
    },
  });

  const payment = await prisma.$transaction(async (tx) => {
    const createdTransfer = await tx.bizumTransfer.create({
      data: {
        amountCents: bizumRequest.amountCents,
        completedAt: new Date(),
        concept: bizumRequest.concept,
        idempotencyKey,
        receiverCardId: requesterCard?.id ?? null,
        receiverUserId: bizumRequest.requesterUserId,
        referenceCode: buildReferenceCode("BTR"),
        senderCardId: payerCard.id,
        senderUserId: authenticatedUser.id,
      },
    });

    await tx.bizumRequest.update({
      data: {
        acceptedAt: new Date(),
        transferId: createdTransfer.id,
      },
      where: {
        id: bizumRequest.id,
      },
    });

    await tx.target.update({
      data: {
        balanceCents: {
          decrement: bizumRequest.amountCents,
        },
      },
      where: {
        id: payerCard.id,
      },
    });

    if (requesterCard?.id) {
      await tx.target.update({
        data: {
          balanceCents: {
            increment: bizumRequest.amountCents,
          },
        },
        where: {
          id: requesterCard.id,
        },
      });
    }

    const [payerTotalBalance, payerAvailableBalance, requesterTotalBalance] = await Promise.all([
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
          userId: bizumRequest.requesterUserId,
        },
      }),
    ]);

    await Promise.all([
      tx.user.update({
        data: {
          totalBalanceCents: payerTotalBalance._sum.balanceCents ?? 0,
        },
        where: {
          id: authenticatedUser.id,
        },
      }),
      tx.user.update({
        data: {
          totalBalanceCents: requesterTotalBalance._sum.balanceCents ?? 0,
        },
        where: {
          id: bizumRequest.requesterUserId,
        },
      }),
    ]);

    const payerName = authenticatedUser.name.trim() || "Un usuario";
    const amountLabel = toMoneyLabel(bizumRequest.amountCents);
    const paymentBody = bizumRequest.concept
      ? `${payerName} ha pagado tu solicitud de ${amountLabel}. Concepto: ${bizumRequest.concept}`
      : `${payerName} ha pagado tu solicitud de ${amountLabel}.`;

    await tx.notification.create({
      data: {
        actionPayload: {
          amountCents: bizumRequest.amountCents,
          amountLabel,
          bizumRequestId: bizumRequest.id,
          transferId: createdTransfer.id,
        },
        actionRoute: "/notification",
        bizumRequestId: bizumRequest.id,
        body: paymentBody,
        title: "Solicitud de Bizum pagada",
        transferId: createdTransfer.id,
        type: "BIZUM_RECEIVED",
        userDestinationId: bizumRequest.requesterUserId,
        userEmisorId: authenticatedUser.id,
      },
    });

    return {
      payerAvailableBalanceCents: payerAvailableBalance._sum.balanceCents ?? 0,
      transferId: createdTransfer.id,
    };
  });

  await registerAudit({
    ...auditMeta,
    action: "BIZUM_TRANSFER_SEND",
    newvaluePayload: {
      amountCents: bizumRequest.amountCents,
      bizumRequestId: bizumRequest.id,
      transferId: payment.transferId,
    },
    sessionId: authenticatedUser.sessionId,
    status: "SUCCESS",
    table: "bizumTransfer",
    targetUserId: bizumRequest.requesterUserId,
    userId: authenticatedUser.id,
    userName: authenticatedUser.name,
    userRol: authenticatedUser.role,
  });

  return {
    availableBalanceCents: payment.payerAvailableBalanceCents,
    paidRequestId: bizumRequest.id,
    transferId: payment.transferId,
  };
}
