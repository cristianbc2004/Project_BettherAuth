import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { useTranslation } from "react-i18next";

export default function SignUpScreen() {
  const { t } = useTranslation();

  return (
    <AuthShell
      eyebrow={t("authShell.signUp.eyebrow")}
      subtitle={t("authShell.signUp.subtitle")}
      title={t("authShell.signUp.title")}
    >
      <AuthForm mode="signUp" />
    </AuthShell>
  );
}
