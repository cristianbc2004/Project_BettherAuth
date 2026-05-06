import { z } from "zod";

import { auth } from "@/features/auth/services/auth";
import { prisma } from "@/shared/lib/prisma";

const createBizumSchema = z.object({
  action: z.enum(["request", "send"]),
  amount: z.number().finite().positive("El importe debe ser mayor que 0."),
  concept: z.string().trim().max(80, "El concepto es demasiado largo.").optional().default(""),
  contactUserId: z.string().trim().min(1, "Selecciona un usuario."),
});

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

function buildReferenceCode(prefix: "BTR" | "BQR") {
  const now = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${now}-${random}`;
}

function toMoneyLabel(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

async function getAuthenticatedUser(request: Request) {
  // Recupera la sesion y devuelve el usuario autenticado con datos minimos.
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

export async function GET(request: Request) {
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  // Carga en paralelo los contactos reales, los movimientos y los saldos del usuario.
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
      initials: getInitials(counterpart?.name ?? "Usuario"),
      name: counterpart?.name ?? "Usuario",
      tone: isIncome ? "income" : "outcome",
    };
  });

  return Response.json({
    availableBalanceCents: balances.availableBalanceCents,
    contacts: contacts.map((contact) => ({
      detail: contact.email,
      id: contact.id,
      initials: getInitials(contact.name),
      name: contact.name,
    })),
    movements,
  });
}

export async function POST(request: Request) {
  const authenticatedUser = await getAuthenticatedUser(request);

  if (!authenticatedUser) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  // Valida y normaliza el payload de entrada para acciones send/request.
  const result = createBizumSchema.safeParse(await request.json().catch(() => null));

  if (!result.success) {
    return Response.json({ error: result.error.issues[0]?.message ?? "Datos invalidos." }, { status: 400 });
  }

  const { action, amount, concept, contactUserId } = result.data;
  const amountCents = Math.round(amount * 100);
  const senderBalances = await getUserBalances(authenticatedUser.id);

  if (contactUserId === authenticatedUser.id) {
    return Response.json({ error: "No puedes hacer Bizum a tu propio usuario." }, { status: 400 });
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
    return Response.json({ error: "El usuario seleccionado no existe." }, { status: 404 });
  }

  if (action === "request") {
    // Pedir Bizum no mueve dinero: crea BizumRequest y notificacion BIZUM_REQUEST.
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

      const requesterName = authenticatedUser.name.trim() || "Un usuario";
      const amountLabel = toMoneyLabel(amountCents);
      const requestBody = requestConcept
        ? `${requesterName} te solicita ${amountLabel}. Concepto: ${requestConcept}`
        : `${requesterName} te solicita ${amountLabel}.`;

      await tx.notification.create({
        data: {
          actionPayload: {
            amountCents,
            amountLabel,
            bizumRequestId: createdRequest.id,
            concept: requestConcept || null,
            requesterUserId: authenticatedUser.id,
          },
          actionRoute: "/notifications",
          bizumRequestId: createdRequest.id,
          body: requestBody,
          title: "Nueva solicitud de Bizum",
          type: "BIZUM_REQUEST",
          userDestinationId: contactUser.id,
          userEmisorId: authenticatedUser.id,
        },
      });

      return createdRequest;
    });

    return Response.json(
      {
        availableBalanceCents: senderBalances.availableBalanceCents,
        request: {
          amountCents: bizumRequest.amountCents,
          id: bizumRequest.id,
        },
      },
      { status: 201 },
    );
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
    return Response.json({ error: "Saldo insuficiente para enviar este Bizum." }, { status: 400 });
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
    // Enviar Bizum si mueve saldo entre tarjetas y actualiza balances agregados.
    const createdTransfer = await tx.bizumTransfer.create({
      data: {
        amountCents,
        completedAt: new Date(),
        concept: concept || null,
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

    return {
      transfer: createdTransfer,
      updatedSenderBalanceCents: senderAvailableBalance._sum.balanceCents ?? 0,
    };
  });

  return Response.json(
    {
      availableBalanceCents: transfer.updatedSenderBalanceCents,
      transfer: {
        amount: `-${toMoneyLabel(transfer.transfer.amountCents)}`,
        createdAt: transfer.transfer.createdAt.toISOString(),
        id: transfer.transfer.id,
        initials: getInitials(transfer.transfer.receiverUser?.name ?? contactUser.name),
        name: transfer.transfer.receiverUser?.name ?? contactUser.name,
        tone: "outcome",
      },
    },
    { status: 201 },
  );
}
