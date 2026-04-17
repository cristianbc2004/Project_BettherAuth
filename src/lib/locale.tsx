import * as SecureStore from "expo-secure-store";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { i18n } from "@/lib/i18n";

export const supportedLocales = ["es", "en"] as const;
export type AppLocale = (typeof supportedLocales)[number];

const LOCALE_STORAGE_KEY = "better-auth-dashboard-locale";
const defaultLocale: AppLocale = "es";

type LanguageContextValue = {
  locale: AppLocale;
  isReady: boolean;
  setLocale: (locale: AppLocale) => Promise<void>;
  toggleLocale: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function buildLanguageHeaders(locale: AppLocale) {
  return {
    "Accept-Language": locale,
  } as const;
}

export function buildAuthFetchOptions(locale: AppLocale) {
  return {
    fetchOptions: {
      headers: buildLanguageHeaders(locale),
    },
  } as const;
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<AppLocale>(defaultLocale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLocale = async () => {
      try {
        const storedLocale = await SecureStore.getItemAsync(LOCALE_STORAGE_KEY);

        if (isMounted && storedLocale && supportedLocales.includes(storedLocale as AppLocale)) {
          setLocaleState(storedLocale as AppLocale);
          await i18n.changeLanguage(storedLocale);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadLocale();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLocale = async (nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    await i18n.changeLanguage(nextLocale);
    await SecureStore.setItemAsync(LOCALE_STORAGE_KEY, nextLocale);
  };

  const toggleLocale = async () => {
    await setLocale(locale === "es" ? "en" : "es");
  };

  const value = useMemo(
    () => ({
      locale,
      isReady,
      setLocale,
      toggleLocale,
    }),
    [isReady, locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }

  return context;
}
