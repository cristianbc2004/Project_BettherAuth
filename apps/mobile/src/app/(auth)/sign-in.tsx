import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function SignInScreen() {
  return (
    <AuthShell
      eyebrow=""
      subtitle="Access your account to manage settings and continue your secure flow."
      title="Sign in to your account."
    >
      <AuthForm mode="signIn" />
    </AuthShell>
  );
}
