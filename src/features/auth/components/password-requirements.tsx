import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type PasswordRequirementsProps = {
  confirmPassword?: string;
  password: string;
  showMatch?: boolean;
};

export function PasswordRequirements({
  confirmPassword,
  password,
  showMatch = false,
}: PasswordRequirementsProps) {
  const { t } = useTranslation();

  const checks = [
    {
      key: "length",
      label: t("authForm.passwordRuleLength"),
      met: password.length >= 8,
    },
    {
      key: "uppercase",
      label: t("authForm.passwordRuleUppercase"),
      met: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: t("authForm.passwordRuleLowercase"),
      met: /[a-z]/.test(password),
    },
    {
      key: "number",
      label: t("authForm.passwordRuleNumber"),
      met: /\d/.test(password),
    },
  ];

  if (showMatch) {
    checks.push({
      key: "match",
      label: t("authForm.passwordsMatch"),
      met: Boolean(password && confirmPassword && password === confirmPassword),
    });
  }

  return (
    <View className="mb-5 mt-[-8px] rounded-[20px] border border-white/6 bg-white/4 px-4 py-3">
      {checks.map((check) => (
        <View className="flex-row items-center py-1" key={check.key}>
          <View
            className={`mr-3 h-2.5 w-2.5 rounded-full ${check.met ? "bg-emerald-400" : "bg-white/20"}`}
          />
          <Text className={`text-sm ${check.met ? "text-emerald-200" : "text-white/55"}`}>
            {check.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
