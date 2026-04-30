import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

type AnimatedNumberProps = {
  animateOnMount?: boolean;
  className?: string;
  duration?: number;
  formatValue?: (value: number) => string;
  style?: StyleProp<TextStyle>;
  value: number;
};

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function defaultFormatValue(value: number) {
  return value.toString();
}

function AnimatedNumberComponent({
  animateOnMount = false,
  className,
  duration = 420,
  formatValue = defaultFormatValue,
  style,
  value,
}: AnimatedNumberProps) {
  const currentValueRef = useRef(value);
  const frameRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);
  const latestFormatterRef = useRef(formatValue);
  latestFormatterRef.current = formatValue;

  const initialText = useMemo(() => formatValue(value), [formatValue, value]);
  const [displayText, setDisplayText] = useState(initialText);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;

      if (!animateOnMount) {
        currentValueRef.current = value;
        setDisplayText(latestFormatterRef.current(value));
        return;
      }
    }

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const from = currentValueRef.current;
    const to = value;

    if (from === to) {
      setDisplayText(latestFormatterRef.current(to));
      return;
    }

    const animationStart = Date.now();

    const tick = () => {
      const elapsed = Date.now() - animationStart;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const nextValue = from + (to - from) * easedProgress;

      currentValueRef.current = nextValue;
      setDisplayText(latestFormatterRef.current(nextValue));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      currentValueRef.current = to;
      setDisplayText(latestFormatterRef.current(to));
      frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [animateOnMount, duration, value]);

  return (
    <Text className={className} style={style}>
      {displayText}
    </Text>
  );
}

export const AnimatedNumber = memo(AnimatedNumberComponent);
