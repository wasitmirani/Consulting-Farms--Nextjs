"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Branded loader for lazy-loaded content (3D scenes, route transitions).
 *
 * With `watch`, it hides itself as soon as a sibling element gets a
 * `data-ready` attribute (set by each 3D scene once it has rendered, or when
 * WebGL is unavailable). This is handled in JS, so it never depends on a
 * stylesheet being up to date.
 */
export default function Loader({
  label = "Loading",
  tone = "dark",
  watch = false,
  className = "",
}: {
  label?: string;
  tone?: "dark" | "light";
  watch?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!watch) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const check = () => {
      if (parent.querySelector(":scope > [data-ready]")) {
        setDone(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const mo = new MutationObserver(() => check() && mo.disconnect());
    mo.observe(parent, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-ready"] });
    // Safety net: never leave a loader up forever
    const t = window.setTimeout(() => setDone(true), 15000);
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [watch]);

  const dark = tone === "dark";
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-hidden={done || undefined}
      style={{ opacity: done ? 0 : 1, visibility: done ? "hidden" : "visible", transition: "opacity .6s ease, visibility .6s" }}
      className={`pointer-events-none absolute inset-0 grid place-items-center ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative grid size-20 place-items-center">
          <svg viewBox="0 0 80 80" className="cf-spin absolute inset-0" aria-hidden>
            <circle cx="40" cy="40" r="36" fill="none" stroke={dark ? "rgba(255,255,255,0.12)" : "rgba(14,42,31,0.1)"} strokeWidth="4" />
            <circle cx="40" cy="40" r="36" fill="none" stroke="#b8e04a" strokeWidth="4" strokeLinecap="round" strokeDasharray="60 170" />
          </svg>
          <svg viewBox="0 0 40 40" className="cf-bob size-10" aria-hidden>
            <path d="M8.5 20.5C8.5 13.6 13.7 9 20 9s11.5 4.6 11.5 11.5c0 .8-.6 1.3-1.4 1.3H9.9c-.8 0-1.4-.5-1.4-1.3Z" fill={dark ? "#f2f6ee" : "#0e2a1f"} />
            <path d="M16.5 21.8h7l-.9 8.2c-.1.9-.9 1.6-1.8 1.6h-1.6c-.9 0-1.7-.7-1.8-1.6l-.9-8.2Z" fill="#b8e04a" />
          </svg>
        </div>
        <div className={`h-1 w-32 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-primary/10"}`}>
          <div className="cf-bar h-full w-1/2 rounded-full bg-highlight" />
        </div>
        <p className={`text-xs font-semibold tracking-[0.16em] uppercase ${dark ? "text-white/70" : "text-primary/60"}`}>{label}</p>
      </div>
    </div>
  );
}
