import { Image, View } from "react-native";

const appLogo = require("../../../../assets/logo.png");

export function AuthBrandMark() {
  return (
    <View className="items-center">
      <Image
        resizeMode="contain"
        source={appLogo}
        style={{
          height: 132,
          width: 132,
        }}
      />
    </View>
  );
}
