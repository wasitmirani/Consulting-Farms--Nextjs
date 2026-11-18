"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { GreenhouseState } from "./three/GreenhouseScene";
import { Drag } from "./Icons";
import Loader from "./Loader";

const GreenhouseScene = dynamic(() => import("./three/GreenhouseScene"), { ssr: false, loading: () => null });

const controls: { key: keyof GreenhouseState; title: string; why: string; icon: string }[] = [
  { key: "vents", title: "Roof vents", why: "Open to release heat and humidity and bring in fresh air — the first line of climate control.", icon: "▲" },
  { key: "shade", title: "Shade screen", why: "Draws across on bright days to cut glare and heat stress, and holds warmth in on cold nights.", icon: "▦" },
  { key: "irrigation", title: "Drip irrigation", why: "Delivers water and nutrients straight to the root zone, row by row, with very little waste.", icon: "●" },
  { key: "fans", title: "Air circulation", why: "Keeps air moving so temperature stays even and leaves dry — reducing the risk of disease.", icon: "✣" },
  { key: "night", title: "Night mode", why: "See the crop after dark, with supplementary grow lights extending the useful light period.", icon: "☾" },
];

export default function GreenhouseExplorer() {
  const [state, setState] = useState<GreenhouseState>({
    vents: true,
    shade: false,
    irrigation: true,
    fans: true,
    night: false,
  });
  const [focus, setFocus] = useState<keyof GreenhouseState>("vents");
  const toggle = (k: keyof GreenhouseState) => {
    setState((s) => ({ ...s, [k]: !s[k] }));
    setFocus(k);
  };
  const current = controls.find((c) => c.key === focus)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
      <div
        className="relative overflow-hidden rounded-[1.75rem] transition-[background] duration-1000"
        style={{
          background: state.night
            ? "linear-gradient(180deg,#0b1730 0%,#1b2b52 55%,#2a3a5e 100%)"
            : "linear-gradient(180deg,#cfe8ee 0%,#eef6f1 55%,#f2f6ee 100%)",
        }}
      >
        <GreenhouseScene state={state} className="h-[360px] w-full sm:h-[480px] lg:h-[580px]" />
        <Loader label="Building the greenhouse" tone={state.night ? "dark" : "light"} watch className="scene-loader" />
        <p className="pointer-events-none absolute bottom-4 left-4 hidden items-center gap-2 rounded-full bg-primary-deep/70 px-3 py-1.5 text-xs font-medium text-cream/85 backdrop-blur [@media(pointer:fine)]:flex">
          <Drag className="size-4" /> Drag to walk around the greenhouse
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold tracking-[0.14em] text-secondary uppercase">Try the controls</p>
        <ul className="space-y-2.5">
          {controls.map((c) => {
            const on = state[c.key];
            return (
              <li key={c.key}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(c.key)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                    on ? "border-secondary/40 bg-white shadow-card" : "border-primary/10 bg-white/50 hover:bg-white"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid size-10 shrink-0 place-items-center rounded-xl text-base transition-colors ${
                      on ? "bg-primary text-highlight" : "bg-tint text-primary/60"
                    }`}
                  >
                    {c.icon}
                  </span>
                  <span className="flex-1 font-bold text-primary">{c.title}</span>
                  <span
                    aria-hidden
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-secondary" : "bg-primary/15"}`}
                  >
                    <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-[left] duration-300 ${on ? "left-6" : "left-1"}`} />
                  </span>
                  <span className="sr-only">{on ? "on" : "off"}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div aria-live="polite" className="mt-2 rounded-2xl bg-primary p-5 text-cream">
          <p className="text-xs font-bold tracking-[0.14em] text-highlight uppercase">
            {current.title} · {state[focus] ? "on" : "off"}
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-cream/80">{current.why}</p>
        </div>
      </div>
    </div>
  );
}
