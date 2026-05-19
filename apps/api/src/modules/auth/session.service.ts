import { prisma } from "@repo/database";

import { auth } from "./auth";

export async function getAuthenticatedUser(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
    where: {
      id: session.user.id,
    },
  });
}
