import { router } from "expo-router";

export function backOrReplace(fallbackHref: Parameters<typeof router.replace>[0]) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}
