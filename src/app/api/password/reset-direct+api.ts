import { hashPassword } from "better-auth/crypto";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; newPassword?: string };
    const email = body.email?.trim().toLowerCase();
    const newPassword = body.newPassword?.trim();

    if (!email || !newPassword) {
      return Response.json({ error: "Email and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return Response.json({ error: "No account was found for that email." }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.account.updateMany({
      where: {
        userId: user.id,
        providerId: "credential",
      },
      data: {
        password: passwordHash,
      },
    });

    console.log(`Password for user ${user.email} has been reset.`);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Could not reset the password." }, { status: 500 });
  }
}
