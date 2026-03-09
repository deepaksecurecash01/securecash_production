import { useState, useEffect, useRef } from "react";

export type HeaderState = "unfixed" | "pinned" | "unpinned";

export default function useHeaderState(threshold: number = 100): HeaderState {
  const [headerState, setHeaderState] = useState<HeaderState>("unfixed");
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < threshold) {
        setHeaderState("unfixed");
      } else if (currentScrollY > lastScrollY.current) {
        setHeaderState("unpinned");
      } else {
        setHeaderState("pinned");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return headerState;
}
