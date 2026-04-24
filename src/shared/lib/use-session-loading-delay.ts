import { useEffect, useRef, useState } from "react";

const DEFAULT_MINIMUM_SESSION_LOADING_MS = 1400;

export function useSessionLoadingDelay(
  isPending: boolean,
  minimumDuration = DEFAULT_MINIMUM_SESSION_LOADING_MS,
) {
  const [isVisible, setIsVisible] = useState(isPending);
  const startedAtRef = useRef<number | null>(isPending ? Date.now() : null);

  useEffect(() => {
    if (isPending) {
      startedAtRef.current = Date.now();
      setIsVisible(true);
      return;
    }

    if (!startedAtRef.current) {
      setIsVisible(false);
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(minimumDuration - elapsed, 0);
    const timeoutId = setTimeout(() => {
      startedAtRef.current = null;
      setIsVisible(false);
    }, remaining);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPending, minimumDuration]);

  return isVisible;
}
