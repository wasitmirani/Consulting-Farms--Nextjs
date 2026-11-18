"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useMemo, useState } from "react";
import { CURRENCIES, FALLBACK_RATES, guessCurrency, isCurrency, type CurrencyCode, type Rates } from "@/lib/currency";
import { submitEnquiry, type EnquiryState } from "@/app/actions";
import { getFootprint } from "@/lib/footprint";
import { useLeadRelay } from "@/lib/useLeadRelay";
import {
  mushroomOptions, greenhouseOptions, consultingOptions,
  estimateMushroom, estimateGreenhouse, formatRange, summarizeEstimate,
  type MushroomInput, type GreenhouseInput,
} from "@/lib/calculator";
import { ArrowRight, Check, Sprout, Greenhouse } from "./Icons";

type Kind = "mushroom" | "greenhouse";
type Opt = { label: string; note: string };

/* ------------------------------------------------------------------ */
/*  Small accessible inputs                                            */
/* ------------------------------------------------------------------ */

function Choice<K extends string>({
  legend, name, options, value, onChange, cols = 3,
}: {
  legend: string; name: string; options: Record<K, Opt>; value: K; onChange: (k: K) => void; cols?: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-primary">{legend}</legend>
      <div className={`grid gap-2 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {(Object.keys(options) as K[]).map((k) => {
          const on = value === k;
          return (
            <label
              key={k}
              className={`relative cursor-pointer rounded-2xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                on ? "border-secondary bg-tint" : "border-primary/10 bg-white hover:border-primary/25"
              }`}
            >
              <input type="radio" name={name} value={k} checked={on} onChange={() => onChange(k)} className="sr-only" />
              <span className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-semibold text-primary">{options[k].label}</span>
                <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${on ? "border-secondary bg-secondary text-white" : "border-primary/20"}`}>
                  {on && <Check className="size-3" />}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink/60">{options[k].note}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Toggles<K extends string>({
  legend, options, value, onChange,
}: {
  legend: string; options: Record<K, Opt>; value: K[]; onChange: (v: K[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-primary">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(options) as K[]).map((k) => {
          const on = value.includes(k);
          return (
            <label
              key={k}
              className={`cursor-pointer rounded-2xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
                on ? "border-secondary bg-tint" : "border-primary/10 bg-white hover:border-primary/25"
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onChange(on ? value.filter((x) => x !== k) : [...value, k])}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-semibold text-primary">{options[k].label}</span>
                <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${on ? "border-secondary bg-secondary text-white" : "border-primary/20"}`}>
                  {on && <Check className="size-3" />}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-snug text-ink/60">{options[k].note}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Slider({
  label, value, min, max, step, unit, onChange, hint,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (n: number) => void; hint?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2.5 flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-primary">{label}</label>
        <span className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            aria-label={`${label} (${unit})`}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
            className="w-24 rounded-xl border border-primary/15 bg-white px-2.5 py-1.5 text-right text-[15px] font-semibold text-primary focus:border-secondary focus:outline-none"
          />
          <span className="text-sm text-ink/60">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="calc-range w-full"
        style={{ background: `linear-gradient(90deg, var(--color-secondary) ${pct}%, rgba(14,42,31,0.1) ${pct}%)` }}
      />
      {hint && <p className="mt-1.5 text-xs text-ink/55">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const initialLead: EnquiryState = { status: "idle" };

export default function CostCalculator({ rates = FALLBACK_RATES }: { rates?: Rates }) {
  const [ccy, setCcyState] = useState<CurrencyCode>("AED");
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("cf_ccy");
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with browser-only preference after hydration
    setCcyState(saved && isCurrency(saved) ? saved : guessCurrency());
  }, []);
  const setCcy = (c: CurrencyCode) => {
    setCcyState(c);
    try {
      localStorage.setItem("cf_ccy", c);
    } catch {}
  };
  const [kind, setKind] = useState<Kind>("mushroom");
  const [m, setM] = useState<MushroomInput>({
    area: 100, crop: "oyster", level: "standard", tiers: 4, addOns: ["warehouse"], consulting: "advisory",
  });
  const [g, setG] = useState<GreenhouseInput>({
    area: 1000, structure: "multispan", cooling: "padfan", growing: "substrate", addOns: ["shade"], consulting: "advisory",
  });

  const est = useMemo(() => (kind === "mushroom" ? estimateMushroom(m) : estimateGreenhouse(g)), [kind, m, g]);
  const summary = useMemo(() => summarizeEstimate(kind, kind === "mushroom" ? m : g, est, ccy, rates), [kind, m, g, est, ccy, rates]);

  const [lead, sendLead, pending] = useActionState(submitEnquiry, initialLead);
  const relay = useLeadRelay(lead);
  const [showForm, setShowForm] = useState(false);

  const onLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const notes = String(fd.get("notes") ?? "").trim();
    fd.set("type", "Cost estimate (calculator)");
    fd.set("product", kind === "mushroom" ? `Mushroom farm setup (${mushroomOptions.crop[m.crop].label})` : "Greenhouse setup");
    fd.set("message", `Please send me a detailed quotation based on my calculator estimate.${notes ? `\n\nNotes: ${notes}` : ""}`);
    fd.set("estimate", summary);
    fd.set("footprint", JSON.stringify(getFootprint()));
    startTransition(() => sendLead(fd));
  };

  const errs = lead.status === "error" ? lead.errors ?? {} : {};

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
      {/* ---------------- Inputs ---------------- */}
      <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-primary/5 sm:p-7">
        <div role="tablist" aria-label="What are you planning?" className="grid grid-cols-2 gap-1.5 rounded-2xl bg-cream p-1.5">
          {([
            ["mushroom", "Mushroom farm", Sprout],
            ["greenhouse", "Greenhouse", Greenhouse],
          ] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              onClick={() => setKind(k)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[15px] font-semibold transition-colors ${
                kind === k ? "bg-primary text-white shadow" : "text-primary/70 hover:text-primary"
              }`}
            >
              <Icon className="size-5" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-7 space-y-7">
          {kind === "mushroom" ? (
            <>
              <Slider label="Grow-room floor area" value={m.area} min={20} max={2000} step={10} unit="m²" onChange={(area) => setM({ ...m, area })} hint="Total floor area of your fruiting / grow rooms." />
              <Slider label="Rack tiers" value={m.tiers} min={1} max={6} step={1} unit="tiers" onChange={(tiers) => setM({ ...m, tiers })} hint="More tiers = more growing surface on the same floor area." />
              <Choice legend="Mushroom type" name="crop" options={mushroomOptions.crop} value={m.crop} onChange={(crop) => setM({ ...m, crop })} />
              <Choice legend="Setup level" name="level" options={mushroomOptions.level} value={m.level} onChange={(level) => setM({ ...m, level })} />
              <Toggles legend="Extra facilities" options={mushroomOptions.addOns} value={m.addOns} onChange={(addOns) => setM({ ...m, addOns })} />
              <Choice legend="Consulting support" name="consulting-m" options={consultingOptions} value={m.consulting} onChange={(consulting) => setM({ ...m, consulting })} />
            </>
          ) : (
            <>
              <Slider label="Greenhouse area" value={g.area} min={100} max={20000} step={50} unit="m²" onChange={(area) => setG({ ...g, area })} hint="1 dunam ≈ 1,000 m² · 1 acre ≈ 4,047 m²" />
              <Choice legend="Structure" name="structure" options={greenhouseOptions.structure} value={g.structure} onChange={(structure) => setG({ ...g, structure })} />
              <Choice legend="Cooling & climate" name="cooling" options={greenhouseOptions.cooling} value={g.cooling} onChange={(cooling) => setG({ ...g, cooling })} />
              <Choice legend="Growing system" name="growing" options={greenhouseOptions.growing} value={g.growing} onChange={(growing) => setG({ ...g, growing })} />
              <Toggles legend="Extras" options={greenhouseOptions.addOns} value={g.addOns} onChange={(addOns) => setG({ ...g, addOns })} />
              <Choice legend="Consulting support" name="consulting-g" options={consultingOptions} value={g.consulting} onChange={(consulting) => setG({ ...g, consulting })} />
            </>
          )}
        </div>
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[1.75rem] bg-primary text-white shadow-[0_30px_70px_-30px_rgba(14,42,31,0.8)]">
          <div className="relative p-6 sm:p-7">
            <div aria-hidden className="absolute -top-20 -right-16 size-60 rounded-full bg-highlight/20 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.16em] text-highlight uppercase">Your indicative estimate</p>
              <label className="flex items-center gap-2 text-xs text-white/60">
                <span className="sr-only sm:not-sr-only">Currency</span>
                <select
                  value={ccy}
                  onChange={(e) => isCurrency(e.target.value) && setCcy(e.target.value)}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/10 py-1.5 pr-8 pl-3 text-sm font-semibold text-white focus:border-highlight focus:outline-none [&>option]:text-ink"
                  aria-label="Currency"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div aria-live="polite" className="relative">
              <p className="mt-3 text-sm text-white/60">Estimated setup investment</p>
              <p className="mt-1 font-display text-[1.75rem] leading-tight font-semibold tracking-tight sm:text-[2.1rem]">{formatRange(est.setup, ccy, rates)}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                  <p className="text-xs text-white/60">Running cost</p>
                  <p className="mt-1 text-[15px] font-semibold">{formatRange(est.monthly, ccy, rates)}</p>
                  <p className="text-xs text-white/50">per month</p>
                </div>
                {est.capacity ? (
                  <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                    <p className="text-xs text-white/60">Indicative capacity</p>
                    <p className="mt-1 text-[15px] font-semibold">
                      {est.capacity.range[0].toLocaleString()}–{est.capacity.range[1].toLocaleString()} kg
                    </p>
                    <p className="text-xs text-white/50">per month, once established</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10">
                    <p className="text-xs text-white/60">Area</p>
                    <p className="mt-1 text-[15px] font-semibold">{g.area.toLocaleString()} m²</p>
                    <p className="text-xs text-white/50">≈ {(g.area / 4047).toFixed(2)} acres</p>
                  </div>
                )}
              </div>
            </div>

            <details className="group relative mt-5 rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold">
                Cost breakdown
                <span className="text-highlight transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="space-y-2 px-4 pb-4 text-sm">
                {est.lines.map((l) => (
                  <li key={l.label} className="flex items-start justify-between gap-4 border-t border-white/10 pt-2">
                    <span className="text-white/70">{l.label}</span>
                    <span className="shrink-0 text-right font-medium">{formatRange(l.range, ccy, rates)}</span>
                  </li>
                ))}
              </ul>
            </details>

            <p className="relative mt-4 text-xs leading-relaxed text-white/50">
              Indicative ranges for the UAE, for planning only — not a quotation. Real costs depend on your site,
              specification, power & water, and supplier pricing.
              {ccy !== "AED" && (
                <>
                  {" "}Converted from AED at 1 AED = {rates.rates[ccy]} {ccy} ({rates.live ? "updated" : "rates as of"} {rates.updated}).{" "}
                  <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                    Rates by Exchange Rate API
                  </a>
                </>
              )}
            </p>
          </div>

          {/* Lead capture */}
          <div className="border-t border-white/10 bg-primary-deep/60 p-6 sm:p-7">
            {lead.status === "success" ? (
              <div role="status" className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-highlight text-primary"><Check className="size-5" /></span>
                <div>
                  <p className="font-semibold">Estimate sent to our team</p>
                  <p className="mt-1 text-sm text-white/70">{lead.message}</p>
                  {relay === "sending" && <p className="mt-2 text-xs text-white/50">Notifying our team…</p>}
                  {relay === "failed" && <p className="mt-2 text-xs text-highlight">Saved — but the instant notification failed. WhatsApp us for a faster reply.</p>}
                </div>
              </div>
            ) : !showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="group flex w-full items-center justify-between gap-3 rounded-full bg-highlight py-2 pr-2 pl-6 text-left text-[15px] font-semibold text-primary transition-transform hover:-translate-y-0.5"
              >
                Get a detailed quote from an expert
                <span className="grid size-10 place-items-center rounded-full bg-primary text-highlight transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="size-4" />
                </span>
              </button>
            ) : (
              <form onSubmit={onLead} className="space-y-3" noValidate={false}>
                <p className="text-sm text-white/75">We&apos;ll email you this estimate and an expert will follow up with a tailored quotation.</p>
                {lead.status === "error" && (
                  <p role="alert" className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-100">{lead.message}</p>
                )}
                <div className="hidden" aria-hidden>
                  <input name="company_website" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="sr-only">Full name</span>
                    <input name="name" required minLength={2} autoComplete="name" placeholder="Full name *" className="calc-field" aria-invalid={!!errs.name || undefined} />
                  </label>
                  <label className="block">
                    <span className="sr-only">Phone / WhatsApp</span>
                    <input name="phone" type="tel" required autoComplete="tel" placeholder="Phone / WhatsApp *" className="calc-field" aria-invalid={!!errs.phone || undefined} />
                  </label>
                </div>
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input name="email" type="email" required autoComplete="email" placeholder="Email *" className="calc-field" aria-invalid={!!errs.email || undefined} />
                </label>
                <label className="block">
                  <span className="sr-only">Location / notes (optional)</span>
                  <input name="notes" placeholder="Location or notes (optional)" className="calc-field" />
                </label>
                <label className="flex items-start gap-2.5 text-xs text-white/70">
                  <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 accent-[#b8e04a]" />
                  <span>
                    I agree that Consulting Farms may contact me about this estimate. See our{" "}
                    <Link href="/privacy" className="underline">privacy notice</Link>.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-highlight px-6 py-3.5 text-[15px] font-semibold text-primary transition-opacity disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Email me this estimate"} {!pending && <ArrowRight className="size-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
