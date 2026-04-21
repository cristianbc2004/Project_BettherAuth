import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useTranslation } from "react-i18next";

export default function SignInScreen() {
  const { t } = useTranslation();

  return (
    <AuthShell
      eyebrow={t("authShell.signIn.eyebrow")}
      subtitle={t("authShell.signIn.subtitle")}
      title={t("authShell.signIn.title")}
    >
      <AuthForm mode="signIn" />
    </AuthShell>
  );
}
