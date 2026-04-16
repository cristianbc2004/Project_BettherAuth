import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function SignUpScreen() {
  return (
    <AuthShell
      eyebrow="Prisma + Neon"
      subtitle="Create an account from the app and persist it through Better Auth into PostgreSQL."
      title="Build your dashboard."
    >
      <AuthForm mode="signUp" />
    </AuthShell>
  );
}
