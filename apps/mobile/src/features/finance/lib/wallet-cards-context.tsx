import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authClient } from "@/features/auth/services/auth-client";
import { type WalletCard } from "@/features/finance/mocks";
import { mapTargetToWalletCard, type WalletCardFormValues } from "@/features/finance/lib/wallet-card-utils";
import { appConfig } from "@repo/config";

type TargetResponse = {
  balanceCents: number;
  block: boolean;
  cvc: string;
  id: string;
  name: string;
  numberTarget: string;
  type: WalletCard["network"];
};

type WalletCardsContextValue = {
  addCard: (values: WalletCardFormValues) => Promise<WalletCard>;
  cards: WalletCard[];
  isLoading: boolean;
  refreshCards: () => Promise<void>;
  updateCardBlock: (cardId: string, block: boolean) => Promise<WalletCard>;
};

const WalletCardsContext = createContext<WalletCardsContextValue | null>(null);

function getAuthCookie() {
  return (authClient as typeof authClient & { getCookie?: () => string }).getCookie?.() ?? "";
}

async function fetchTargetsRequest(path = "/api/targets", init?: RequestInit) {
  return fetch(`${appConfig.authApiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: getAuthCookie(),
      ...init?.headers,
    },
  });
}

export function WalletCardsProvider({ children }: PropsWithChildren) {
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchTargetsRequest();

      if (!response.ok) {
        setCards([]);
        return;
      }

      const payload = (await response.json()) as { targets?: TargetResponse[] };
      setCards((payload.targets ?? []).map(mapTargetToWalletCard));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCards();
  }, [refreshCards]);

  const value = useMemo<WalletCardsContextValue>(
    () => ({
      addCard: async (values) => {
        const response = await fetchTargetsRequest("/api/targets", {
          body: JSON.stringify(values),
          method: "POST",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Could not create the card.");
        }

        const payload = (await response.json()) as { target: TargetResponse };
        const createdCard = mapTargetToWalletCard(payload.target);

        setCards((currentCards) => [createdCard, ...currentCards]);

        return createdCard;
      },
      cards,
      isLoading,
      refreshCards,
      updateCardBlock: async (cardId, block) => {
        const response = await fetchTargetsRequest(`/api/targets/${cardId}`, {
          body: JSON.stringify({ block }),
          method: "PATCH",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Could not update the card.");
        }

        const payload = (await response.json()) as { target: TargetResponse };
        const updatedCard = mapTargetToWalletCard(payload.target);

        setCards((currentCards) =>
          currentCards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
        );

        return updatedCard;
      },
    }),
    [cards, isLoading, refreshCards],
  );

  return <WalletCardsContext.Provider value={value}>{children}</WalletCardsContext.Provider>;
}

export function useWalletCards() {
  const context = useContext(WalletCardsContext);

  if (!context) {
    throw new Error("useWalletCards must be used within WalletCardsProvider");
  }

  return context;
}
