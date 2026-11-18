"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useState } from "react";
import { facilityZones } from "@/lib/site";
import { Check, Drag } from "./Icons";
import EnquireButton from "./EnquireButton";
import Loader from "./Loader";

const FacilityScene = dynamic(() => import("./three/FacilityScene"), { ssr: false, loading: () => null });

export default function FacilityExplorer() {
  const [active, setActive] = useState<number | null>(null);
  const select = useCallback((i: number | null) => setActive(i), []);
  const shown = active ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8">
      {/* 3D view */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-cream/10 bg-[radial-gradient(120%_90%_at_50%_0%,#1d4a33_0%,#0e2a1f_55%,#07190f_100%)]">
        <FacilityScene
          active={active}
          onSelect={select}
          zones={facilityZones.map((z) => ({ name: z.name, color: z.color }))}
          className="h-[340px] w-full sm:h-[460px] lg:h-[560px]"
        />
        <Loader label="Loading farm rooms" watch className="scene-loader" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <p className="hidden items-center gap-2 rounded-full bg-primary-deep/70 px-3 py-1.5 text-xs font-medium text-cream/80 backdrop-blur [@media(pointer:fine)]:flex">
            <Drag className="size-4" /> Drag to look around · click a room
          </p>
          {active !== null && (
            <button
              type="button"
              onClick={() => select(null)}
              className="pointer-events-auto ml-auto rounded-full bg-cream px-4 py-2 text-xs font-bold text-primary shadow-lg transition-transform hover:-translate-y-0.5"
            >
              ← Whole farm
            </button>
          )}
        </div>
      </div>

      {/* Room details */}
      <div className="flex flex-col">
        <div role="tablist" aria-label="Farm rooms" className="grid grid-cols-2 gap-2">
          {facilityZones.map((z, i) => {
            const on = shown === i;
            return (
              <button
                key={z.id}
                id={`tab-${z.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`panel-${z.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  const n = (i + (e.key === "ArrowRight" ? 1 : facilityZones.length - 1)) % facilityZones.length;
                  select(n);
                  document.getElementById(`tab-${facilityZones[n].id}`)?.focus();
                }}
                className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  on ? "border-cream/30 bg-cream/10" : "border-cream/10 hover:border-cream/20 hover:bg-cream/5"
                }`}
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-deep"
                  style={{ background: z.color }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-cream">{z.name}</span>
                  <span className="block truncate text-xs text-cream/55">{z.short}</span>
                </span>
              </button>
            );
          })}
        </div>

        {facilityZones.map((z, i) => (
          <div
            key={z.id}
            id={`panel-${z.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${z.id}`}
            hidden={shown !== i}
            className="mt-6 flex-1 overflow-hidden rounded-[1.5rem] border border-cream/10 bg-cream/[0.04]"
          >
            <div className="relative h-40 sm:h-48">
              <Image src={z.image} alt={z.imageAlt} fill sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0b2117] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                Real photo · our farm
              </span>
            </div>
            <div className="p-6 sm:p-7">
            <p className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: z.color }}>
              Room {i + 1} of {facilityZones.length}
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-cream">{z.name}</h3>
            <p className="mt-3 leading-relaxed text-cream/75">{z.lead}</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <h4 className="text-sm font-bold text-cream">What happens here</h4>
                <ul className="mt-3 space-y-2.5">
                  {z.happens.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm text-cream/70">
                      <Check className="mt-0.5 size-4 shrink-0" style={{ color: z.color }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-cream">What we manage</h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {z.manage.map((m) => (
                    <li key={m} className="rounded-full border border-cream/15 px-3 py-1.5 text-xs font-medium text-cream/80">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </div>
          </div>
        ))}

        <EnquireButton
          type="Farm setup & consulting"
          product="Consulting services"
          className="mt-6 inline-flex items-center justify-between gap-3 rounded-2xl bg-cream px-5 py-4 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5"
        >
          <span>Planning your own grow rooms or warehouse? We can help design them.</span>
          <span aria-hidden>→</span>
        </EnquireButton>
      </div>
    </div>
  );
}
