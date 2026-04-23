import { AnimatedButton } from "react-native-3d-animated-buttons";

type AuthSubmitButtonProps = {
  isPending: boolean;
  label: string;
  onPress: () => void;
};

export function AuthSubmitButton({ isPending, label, onPress }: AuthSubmitButtonProps) {
  return (
    <AnimatedButton
      backgroundColor="#8d3dff"
      disabled={isPending}
      fullWidth={true}
      hapticStyle="Medium"
      minHeight={56}
      onPress={onPress}
      shadowColor="#6f2fe0"
      textColor="#ffffff"
      textStyle={{ fontSize: 16, fontWeight: "600" }}
      title={label}
      type="capsule"
      style={{ marginTop: 16 }}
    />
  );
}
