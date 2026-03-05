import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  prefix: boolean;
  duration?: number;
  isUpdate?: boolean;
  shouldAnimate?: boolean;
}

const AnimatedCounter = ({
  end,
  prefix,
  duration = 3,
  isUpdate = false,
  shouldAnimate = true,
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(isUpdate ? end : 0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(isUpdate ? end : 0);

  useEffect(() => {
    if (!shouldAnimate) return;

    startValueRef.current = count;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startTimeRef.current) / (duration * 1000),
        1,
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(
        startValueRef.current + (end - startValueRef.current) * eased,
      );
      setCount(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, shouldAnimate]);

  return (
    <>
      {prefix ? "$" : ""}
      {count.toLocaleString()}
    </>
  );
};

export default AnimatedCounter;
