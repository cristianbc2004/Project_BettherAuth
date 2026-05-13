import { forwardRef } from "react";
import { Text, type TextProps, type TextStyle } from "react-native";

import { useAppTheme } from "@/shared/lib/theme-context";

type AppTextVariant =
  | "body"
  | "button"
  | "caption"
  | "eyebrow"
  | "info"
  | "screenTitle"
  | "sectionTitle"
  | "subtitle";

type AppTextTone = "default" | "danger" | "muted" | "primary" | "success";

type AppTextProps = TextProps & {
  tone?: AppTextTone;
  variant?: AppTextVariant;
};

const variantClassNames: Record<AppTextVariant, string> = {
  body: "text-[13px] font-medium leading-5",
  button: "text-[12px] font-black",
  caption: "text-[10px] font-semibold leading-4",
  eyebrow: "text-[10px] font-black uppercase tracking-[1.6px]",
  info: "text-[12px] leading-5",
  screenTitle: "text-[22px] font-semibold",
  sectionTitle: "text-[16px] font-black",
  subtitle: "text-[11px] font-medium leading-4",
};

export const AppText = forwardRef<Text, AppTextProps>(function AppText(
  {
    className,
    style,
    tone = "default",
    variant = "body",
    ...props
  },
  ref,
) {
  const { theme } = useAppTheme();
  const colorByTone: Record<AppTextTone, TextStyle["color"]> = {
    danger: theme.danger,
    default: theme.text,
    muted: theme.mutedText,
    primary: theme.primary,
    success: theme.success,
  };

  return (
    <Text
      ref={ref}
      className={[variantClassNames[variant], className].filter(Boolean).join(" ")}
      style={[{ color: colorByTone[tone] }, style]}
      {...props}
    />
  );
});
