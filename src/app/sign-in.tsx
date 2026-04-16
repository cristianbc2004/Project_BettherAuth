import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function SignInScreen() {
  return (
    <AuthShell
      eyebrow="Expo + Better Auth"
      subtitle="A managed Expo app using Router, NativeWind, Reanimated, Prisma, and Neon-backed Postgres."
      title="Secure mobile auth."
    >
      <AuthForm mode="signIn" />
    </AuthShell>
  );
}
