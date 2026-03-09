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
  const countRef = useRef(isUpdate ? end : 0); // ← always current, no stale closure
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAnimate) return;

    // Capture current rendered value via ref — safe regardless of when effect fires
    const startValue = countRef.current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startTimeRef.current) / (duration * 1000),
        1,
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * eased);

      countRef.current = currentValue; // ← keep ref in sync
      setCount(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, shouldAnimate]); // ← dep array now honest — no missing deps

  return (
    <>
      {prefix ? "$" : ""}
      {count.toLocaleString()}
    </>
  );
};

export default AnimatedCounter;
