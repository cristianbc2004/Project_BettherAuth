import { prisma } from "@repo/database";

export function getInitials(name: string) {
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

export function buildReferenceCode(prefix: "BTR" | "BQR") {
  const now = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${now}-${random}`;
}

export function toMoneyLabel(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

export function readIdempotencyKey(request: Request) {
  return request.headers.get("Idempotency-Key")?.trim() ?? "";
}

export async function getUserBalances(userId: string) {
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
