import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { initialWalletCards, type WalletCard } from "@/features/finance/mocks";
import { buildWalletCardPreview, type WalletCardFormValues } from "@/features/finance/lib/wallet-card-utils";

const WALLET_CARDS_STORAGE_KEY = "@better_auth_dashboard_wallet_cards";

type WalletCardsContextValue = {
  addCard: (values: WalletCardFormValues) => WalletCard;
  cards: WalletCard[];
};

const WalletCardsContext = createContext<WalletCardsContextValue | null>(null);

export function WalletCardsProvider({ children }: PropsWithChildren) {
  const [cards, setCards] = useState<WalletCard[]>(initialWalletCards);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const savedCards = await AsyncStorage.getItem(WALLET_CARDS_STORAGE_KEY);

        if (!savedCards) {
          return;
        }

        const parsedCards = JSON.parse(savedCards) as WalletCard[];

        if (Array.isArray(parsedCards) && parsedCards.length > 0) {
          setCards(parsedCards);
        }
      } catch {
        setCards(initialWalletCards);
      } finally {
        setHasHydrated(true);
      }
    };

    void loadCards();
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    void AsyncStorage.setItem(WALLET_CARDS_STORAGE_KEY, JSON.stringify(cards)).catch(() => {
      // Persistence failure should not block wallet interactions.
    });
  }, [cards, hasHydrated]);

  const value = useMemo<WalletCardsContextValue>(
    () => ({
      addCard: (values) => {
        const previewCard = buildWalletCardPreview(values);
        const createdCard: WalletCard = {
          ...previewCard,
          id: `${values.network.toLowerCase()}-${Date.now()}`,
        };

        setCards((currentCards) => [createdCard, ...currentCards]);

        return createdCard;
      },
      cards,
    }),
    [cards],
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
