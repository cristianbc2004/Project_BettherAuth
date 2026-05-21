import { Platform } from "react-native";

import { appConfig } from "@repo/config";

const mapLibre =
  Platform.OS === "web"
    ? null
    : (require("@maplibre/maplibre-react-native") as typeof import("@maplibre/maplibre-react-native"));

export const nativeMapStyleUrl = `${appConfig.authApiUrl}/api/maps/style`;

export function getNativeMapComponents() {
  if (Platform.OS === "web" || !mapLibre?.Map || !mapLibre.Camera || !mapLibre.Marker) {
    return null;
  }

  return {
    Camera: mapLibre.Camera,
    Map: mapLibre.Map,
    Marker: mapLibre.Marker,
  };
}
