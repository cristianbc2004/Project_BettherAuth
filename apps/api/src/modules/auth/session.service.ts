import { prisma } from "@repo/database";

import { auth } from "./auth";

export async function getSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function getAuthenticatedUserWithSession(request: Request) {
  const session = await getSession(request);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
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

  if (!user) {
    return null;
  }

  return {
    ...user,
    sessionId: session.session.id,
  };
}

export async function getAuthenticatedUser(request: Request) {
  const authenticatedUser = await getAuthenticatedUserWithSession(request);
  return authenticatedUser
    ? {
        email: authenticatedUser.email,
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
      }
    : null;
}
