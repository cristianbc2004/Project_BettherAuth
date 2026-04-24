import { useState } from "react";

import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthShell } from "@/features/auth/components/auth-shell";

export default function SignUpScreen() {
  const [isPasswordRequirementsFocused, setIsPasswordRequirementsFocused] = useState(false);
  const [passwordRequirementsScrollRequest, setPasswordRequirementsScrollRequest] = useState(0);

  return (
    <AuthShell
      eyebrow=""
      keyboardFocusScrollY={isPasswordRequirementsFocused ? 260 : undefined}
      scrollRequestKey={isPasswordRequirementsFocused ? passwordRequirementsScrollRequest : undefined}
      subtitle="Set up your access and continue with the same secure mobile experience."
      title="Create Your Access."
    >
      <AuthForm
        mode="signUp"
        onPasswordRequirementsDismiss={() => {
          setIsPasswordRequirementsFocused(false);
        }}
        onPasswordRequirementsFocus={() => {
          setIsPasswordRequirementsFocused(true);
          setPasswordRequirementsScrollRequest((currentValue) => currentValue + 1);
        }}
      />
    </AuthShell>
  );
}
