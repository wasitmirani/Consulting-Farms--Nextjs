"use client";

import { useEffect } from "react";

/**
 * Fades `[data-reveal]` elements in as they scroll into view.
 * Only elements still below the fold are hidden, and only once JS runs —
 * so content is never invisible to crawlers or no-JS visitors.
 */
export default function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.reveal = "shown";
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.dataset.reveal = "hidden";
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);
  return null;
}
