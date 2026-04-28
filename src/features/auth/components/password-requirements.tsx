import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

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
  const { theme } = useAppTheme();

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
    <View className="mb-5 mt-[-8px] rounded-[20px] px-4 py-3" style={{ backgroundColor: theme.inputBackground }}>
      {checks.map((check) => (
        <View className="flex-row items-center py-1" key={check.key}>
          <View
            className="mr-3 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: check.met ? theme.success : theme.border }}
          />
          <Text className="text-sm" style={{ color: check.met ? theme.success : theme.mutedText }}>
            {check.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
