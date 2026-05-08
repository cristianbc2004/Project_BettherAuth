import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function SignInScreen() {
  return (
    <AuthShell
      eyebrow=""
      subtitle="Accede a tu cuenta para gestionar los ajustes y continuar con tu flujo seguro."
      title="Inicia sesion en tu cuenta."
    >
      <AuthForm mode="signIn" />
    </AuthShell>
  );
}
