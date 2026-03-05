"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function JivoWidget() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const startLoading = () => setShouldLoad(true);

    const interactionEvents = ["scroll", "mousemove", "keydown", "touchstart"];

    interactionEvents.forEach((event) =>
      window.addEventListener(event, startLoading, {
        passive: true,
        once: true,
      }),
    );

    const timer = setTimeout(startLoading, 5000);

    return () => {
      clearTimeout(timer);
      interactionEvents.forEach((event) =>
        window.removeEventListener(event, startLoading),
      );
    };
  }, []);

  if (!shouldLoad) return null;

  return (
    <Script
      src="https://code.jivosite.com/widget.js"
      data-jv-id={process.env.NEXT_PUBLIC_JIVO_ID}
      strategy="lazyOnload"
    />
  );
}
