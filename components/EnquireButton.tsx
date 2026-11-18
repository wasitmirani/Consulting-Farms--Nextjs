"use client";

import type { ReactNode } from "react";

/** Scrolls to the enquiry form and preselects a product / enquiry type. */
export default function EnquireButton({
  product,
  type,
  className,
  children,
}: {
  product?: string;
  type?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#contact"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent("cf:enquire", { detail: { product, type } }));
      }}
    >
      {children}
    </a>
  );
}
