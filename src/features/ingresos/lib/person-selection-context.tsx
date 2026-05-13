import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PersonSelectionContextValue = {
  selectedPersonId?: number;
  setSelectedPersonId: (personId: number) => void;
};

const PersonSelectionContext = createContext<PersonSelectionContextValue | null>(null);

export function PersonSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>();
  const value = useMemo(
    () => ({
      selectedPersonId,
      setSelectedPersonId,
    }),
    [selectedPersonId],
  );

  return (
    <PersonSelectionContext.Provider value={value}>
      {children}
    </PersonSelectionContext.Provider>
  );
}

export function usePersonSelection() {
  const context = useContext(PersonSelectionContext);

  if (!context) {
    throw new Error("usePersonSelection must be used within PersonSelectionProvider");
  }

  return context;
}
