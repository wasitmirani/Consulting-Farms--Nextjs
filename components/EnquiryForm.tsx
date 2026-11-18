"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { submitEnquiry, type EnquiryState } from "@/app/actions";
import { getFootprint } from "@/lib/footprint";
import { enquiryTypes, products } from "@/lib/site";
import { Check, ArrowRight } from "./Icons";

const initial: EnquiryState = { status: "idle" };

export const ENQUIRE_EVENT = "cf:enquire";

export default function EnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const [product, setProduct] = useState("");
  const [type, setType] = useState<string>(enquiryTypes[0]);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // "Enquire" buttons elsewhere on the page preselect the product.
  useEffect(() => {
    const onEnquire = (e: Event) => {
      const detail = (e as CustomEvent<{ product?: string; type?: string }>).detail;
      if (detail.product) setProduct(detail.product);
      if (detail.type) setType(detail.type);
    };
    window.addEventListener(ENQUIRE_EVENT, onEnquire);
    return () => window.removeEventListener(ENQUIRE_EVENT, onEnquire);
  }, []);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state.status]);

  const errors: Record<string, string | undefined> = { ...clientErrors, ...(state.status === "error" ? state.errors : {}) };

  // Submit via a transition (not the form `action` prop) so React doesn't
  // reset the fields — visitors never lose what they typed on a validation error.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Record<string, string> = {};
    for (const el of Array.from(form.elements) as HTMLInputElement[]) {
      if (el.name && !el.checkValidity()) next[el.name] = el.dataset.msg ?? el.validationMessage;
    }
    setClientErrors(next);
    if (Object.keys(next).length) {
      (form.querySelector(`[name="${Object.keys(next)[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    const fd = new FormData(form);
    fd.set("footprint", JSON.stringify(getFootprint()));
    startTransition(() => action(fd));
  };

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-card outline-none"
      >
        <span className="mb-5 grid size-16 place-items-center rounded-full bg-secondary/15 text-secondary">
          <Check className="size-8" />
        </span>
        <h3 className="font-display text-2xl text-primary">Enquiry received</h3>
        <p className="mt-3 max-w-sm text-ink/70">{state.message}</p>
      </div>
    );
  }

  const field = "field";
  const err = (n: string) =>
    errors[n] ? (
      <p id={`${n}-error`} className="mt-1.5 text-sm font-medium text-error">
        {errors[n]}
      </p>
    ) : null;
  const aria = (n: string) => ({
    "aria-invalid": errors[n] ? true : undefined,
    "aria-describedby": errors[n] ? `${n}-error` : undefined,
  });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl bg-white p-6 shadow-card sm:p-8"
      aria-describedby="form-note"
    >
      {state.status === "error" && state.message && (
        <div role="alert" className="mb-6 rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm font-medium text-error">
          {state.message}
        </div>
      )}

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Full name <span className="text-accent">*</span></label>
          <input id="name" name="name" required minLength={2} autoComplete="name" className={field} data-msg="Please enter your full name." {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="business" className="label">Business name <span className="text-ink/45">(optional)</span></label>
          <input id="business" name="business" autoComplete="organization" className={field} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email <span className="text-accent">*</span></label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className={field} data-msg="Please enter a valid email address." {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone / WhatsApp <span className="text-accent">*</span></label>
          <input id="phone" name="phone" type="tel" required pattern="\+?[\d\s\(\)\-]{7,20}" autoComplete="tel" inputMode="tel" className={field} data-msg="Please enter a valid phone or WhatsApp number." {...aria("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="type" className="label">Enquiry type <span className="text-accent">*</span></label>
          <select id="type" name="type" required className={field} value={type} onChange={(e) => setType(e.target.value)} {...aria("type")}>
            {enquiryTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {err("type")}
        </div>
        <div>
          <label htmlFor="product" className="label">Product of interest</label>
          <select id="product" name="product" className={field} value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Not sure yet</option>
            {products.map((p) => (
              <option key={p.slug} value={p.name}>{p.name}</option>
            ))}
            <option>Consulting services</option>
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="label">Estimated quantity <span className="text-ink/45">(optional)</span></label>
          <input id="quantity" name="quantity" placeholder="e.g. 20 kg / week" className={field} />
        </div>
        <div>
          <label htmlFor="area" className="label">Delivery city / area <span className="text-ink/45">(optional)</span></label>
          <input id="area" name="area" autoComplete="address-level2" className={field} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="label">Message <span className="text-accent">*</span></label>
          <textarea id="message" name="message" required minLength={10} maxLength={3000} rows={4} className={`${field} resize-y`} placeholder="Tell us what you need — variety, quantity, frequency, or the farm challenge you're facing." data-msg="Please tell us a little more (at least 10 characters)." {...aria("message")} />
          {err("message")}
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink/75">
            <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0 accent-primary" data-msg="Please confirm we may contact you about this enquiry." {...aria("consent")} />
            <span>
              I agree that Consulting Farms may contact me about this enquiry. See our{" "}
              <Link href="/privacy" className="font-medium text-primary underline underline-offset-2">privacy notice</Link>.
            </span>
          </label>
          {err("consent")}
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-xs text-ink/55">
          Fields marked <span className="text-accent">*</span> are required. We never share your details.
        </p>
        <button type="submit" disabled={pending} className="btn-primary w-full justify-center sm:w-auto disabled:opacity-60">
          {pending ? "Sending…" : "Send enquiry"}
          {!pending && <ArrowRight className="size-4" />}
        </button>
      </div>
    </form>
  );
}
