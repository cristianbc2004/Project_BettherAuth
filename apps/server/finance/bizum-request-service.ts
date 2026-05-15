import { auth } from "@repo/server/auth/auth";
import { extractAuditRequestMeta, registrarAuditoria } from "@repo/server/audit/auditoria";
import { prisma } from "@repo/database";

function getInitials(name: string) {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return "??";
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }

  return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase();
}

function buildReferenceCode(prefix: "BTR") {
  const now = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${now}-${random}`;
}

function toMoneyLabel(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

function readIdempotencyKey(request: Request) {
  return request.headers.get("Idempotency-Key")?.trim() ?? "";
}

async function getAuthenticatedUser(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      role: true,
    },
    where: {
      id: session.user.id,
    },
  });

  return user ?? null;
}

async function getUserBalances(userId: string) {
  const [availableBalance, totalBalance] = await Promise.all([
    prisma.target.aggregate({
      _sum: {
        balanceCents: true,
      },
      where: {
        block: false,
        userId,
      },
    }),
    prisma.target.aggregate({
      _sum: {
        balanceCents: true,
      },
      where: {
        userId,
      },
    }),
  ]);

  return {
    availableBalanceCents: availableBalance._sum.balanceCents ?? 0,
    totalBalanceCents: totalBalance._sum.balanceCents ?? 0,
  };
}

export async function GET(request: Request, { id }: { id: string }) {
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
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
    return Response.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }

  return Response.json({
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
  });
}

export async function POST(request: Request, { id }: { id: string }) {
  const auditMeta = extractAuditRequestMeta(request);
  const authenticatedUser = await getAuthenticatedUser(request);
  const idempotencyKey = readIdempotencyKey(request);

  if (!authenticatedUser) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!idempotencyKey) {
    return Response.json({ error: "Falta la cabecera Idempotency-Key." }, { status: 400 });
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
    await registrarAuditoria({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "Solicitud no encontrada.",
      newvaluePayload: { bizumRequestId: id },
      status: "FAILED",
      table: "bizumRequest",
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    return Response.json({ error: "Solicitud no encontrada." }, { status: 404 });
  }

  if (bizumRequest.acceptedAt || bizumRequest.rejectedAt || bizumRequest.cancelledAt || bizumRequest.transferId) {
    await registrarAuditoria({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "La solicitud ya no esta disponible para pago.",
      newvaluePayload: { bizumRequestId: bizumRequest.id },
      status: "FAILED",
      table: "bizumRequest",
      targetUserId: bizumRequest.requesterUserId,
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    return Response.json({ error: "La solicitud ya no esta disponible para pago." }, { status: 400 });
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
    await registrarAuditoria({
      ...auditMeta,
      action: "BIZUM_TRANSFER_SEND",
      errorMensaje: "Saldo insuficiente para pagar la solicitud.",
      newvaluePayload: {
        amountCents: bizumRequest.amountCents,
        bizumRequestId: bizumRequest.id,
      },
      status: "FAILED",
      table: "bizumTransfer",
      targetUserId: bizumRequest.requesterUserId,
      userId: authenticatedUser.id,
      userName: authenticatedUser.name,
      userRol: authenticatedUser.role,
    });
    return Response.json({ error: "Saldo insuficiente para pagar la solicitud." }, { status: 400 });
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
      return Response.json(
        { error: "La Idempotency-Key ya fue usada con otra operacion." },
        { status: 409 },
      );
    }

    const payerBalances = await getUserBalances(authenticatedUser.id);
    return Response.json({
      availableBalanceCents: payerBalances.availableBalanceCents,
      paidRequestId: bizumRequest.id,
      transferId: existingTransfer.id,
    });
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

  await registrarAuditoria({
    ...auditMeta,
    action: "BIZUM_TRANSFER_SEND",
    newvaluePayload: {
      amountCents: bizumRequest.amountCents,
      bizumRequestId: bizumRequest.id,
      transferId: payment.transferId,
    },
    status: "SUCCESS",
    table: "bizumTransfer",
    targetUserId: bizumRequest.requesterUserId,
    userId: authenticatedUser.id,
    userName: authenticatedUser.name,
    userRol: authenticatedUser.role,
  });

  return Response.json({
    availableBalanceCents: payment.payerAvailableBalanceCents,
    paidRequestId: bizumRequest.id,
    transferId: payment.transferId,
  });
}
