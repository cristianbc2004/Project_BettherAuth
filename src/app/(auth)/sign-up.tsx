import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function SignUpScreen() {
  return (
    <AuthShell
      eyebrow=""
      subtitle="Set up your access and continue with the same secure mobile experience."
      title="Create Your Access."
    >
      <AuthForm mode="signUp" />
    </AuthShell>
  );
}
