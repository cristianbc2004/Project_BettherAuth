import { prisma } from "@/lib/prisma";

async function handleEmailCheck(email: string | undefined) {
  try {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    return Response.json({ exists: Boolean(user) });
  } catch {
    return Response.json({ error: "Could not verify the email." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") ?? undefined;
  return handleEmailCheck(email);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  return handleEmailCheck(body.email);
}
