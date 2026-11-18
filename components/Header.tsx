"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark, Menu, Close, ArrowRight } from "./Icons";
import { site } from "@/lib/site";

const nav = [
  { href: "/#about", label: "About" },
  { href: "/#products", label: "Products" },
  { href: "/#services", label: "Services" },
  { href: "/#farm", label: "Our Farm" },
  { href: "/#greenhouse", label: "Greenhouse" },
  { href: "/calculator", label: "Cost Calculator" },
  { href: "/#faq", label: "FAQs" },
];

/** Floating glass navigation bar with the brand logo. */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto max-w-7xl rounded-[1.75rem] border transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled || open
            ? "border-primary/10 bg-white/90 shadow-[0_12px_40px_-16px_rgba(14,42,31,0.35)] backdrop-blur-xl"
            : "border-white/40 bg-white/80 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.5)] backdrop-blur-md"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 pr-2 pl-4 sm:pl-5">
          <Link href="/#top" className="flex shrink-0 items-center gap-2.5 rounded-full" aria-label={`${site.name} — home`}>
            <LogoMark className="size-10" />
            <span className="font-display text-xl font-semibold tracking-[-0.02em] text-primary">{site.name}</span>
          </Link>

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="rounded-full px-3.5 py-2 text-[15px] font-medium text-ink/70 transition-colors hover:bg-tint hover:text-primary"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/#contact"
              className="group hidden items-center gap-2 rounded-full bg-primary py-2.5 pr-2.5 pl-5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep sm:inline-flex"
            >
              Request a Quote
              <span className="grid size-7 place-items-center rounded-full bg-highlight text-primary transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full text-primary hover:bg-tint xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <Close className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        <div id="mobile-nav" hidden={!open} className="border-t border-primary/10 xl:hidden">
          <nav aria-label="Mobile" className="px-3 py-3">
            <ul className="grid gap-1 sm:grid-cols-2">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-ink hover:bg-tint"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/#contact" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full justify-center sm:hidden">
              Request a Quote
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
