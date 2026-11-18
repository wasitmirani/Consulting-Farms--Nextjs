"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordPageview, recordSection } from "@/lib/footprint";

/** Records page views + which key sections were seen. Renders nothing. */
export default function FootprintTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordPageview();
    const ids = ["products", "services", "farm", "greenhouse", "calculator", "wholesale", "video", "faq", "contact"];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            recordSection(e.target.id);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.35 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
