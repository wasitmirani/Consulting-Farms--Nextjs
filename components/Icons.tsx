import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...p,
});

export const LogoMark = (p: P) => (
  <svg viewBox="0 0 40 40" aria-hidden {...p}>
    <circle cx="20" cy="20" r="20" fill="#0e2a1f" />
    <path d="M8.5 20.5C8.5 13.6 13.7 9 20 9s11.5 4.6 11.5 11.5c0 .8-.6 1.3-1.4 1.3H9.9c-.8 0-1.4-.5-1.4-1.3Z" fill="#f2f6ee" />
    <path d="M16.5 21.8h7l-.9 8.2c-.1.9-.9 1.6-1.8 1.6h-1.6c-.9 0-1.7-.7-1.8-1.6l-.9-8.2Z" fill="#b8e04a" />
    <circle cx="15" cy="15.5" r="1.4" fill="#b8e04a" />
    <circle cx="23.5" cy="13.5" r="1" fill="#b8e04a" />
    <circle cx="26" cy="17.5" r="1.2" fill="#b8e04a" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const Sprout = (p: P) => (
  <svg {...base(p)}><path d="M12 21v-9" /><path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7Z" /><path d="M12 14c0-3-2.5-5.5-7-5.5 0 4 2.5 5.5 7 5.5Z" /></svg>
);
export const Greenhouse = (p: P) => (
  <svg {...base(p)}><path d="M3 21V11a9 9 0 0 1 18 0v10" /><path d="M3 21h18M12 2v19M3.5 14h17M7.5 4.5V21M16.5 4.5V21" /></svg>
);
export const Leaf = (p: P) => (
  <svg {...base(p)}><path d="M4 20c0-9 6-15 16-16-1 10-7 16-16 16Z" /><path d="M4 20 14 10" /></svg>
);
export const Users = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.8.7 3 2.5 3.5 5.2" /></svg>
);
export const Truck = (p: P) => (
  <svg {...base(p)}><path d="M2 6h11v10H2zM13 9h4.5l3.5 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
);
export const Shield = (p: P) => (
  <svg {...base(p)}><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
);
export const Package = (p: P) => (
  <svg {...base(p)}><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9M7.5 5.2l9 4.6" /></svg>
);
export const Chat = (p: P) => (
  <svg {...base(p)}><path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4A8 8 0 1 1 20 12Z" /></svg>
);
export const Phone = (p: P) => (
  <svg {...base(p)}><path d="M5 3h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 7.1 7.1l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg>
);
export const Mail = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6 8.5 7 8.5-7" /></svg>
);
export const Pin = (p: P) => (
  <svg {...base(p)}><path d="M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const Instagram = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg>
);
export const Plus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const Check = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const Menu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const Close = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const Drag = (p: P) => (
  <svg {...base(p)}><path d="M8 9 5 12l3 3M16 9l3 3-3 3M5 12h14" /></svg>
);
export const WhatsApp = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6 13.4 13.4 0 0 1-5.2-4.6c-.4-.5-1-1.5-1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.3 0 .5l-.3.5-.4.5c-.2.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.1.1.7-.1 1.4Z" />
  </svg>
);
export const Rack = (p: P) => (
  <svg {...base(p)}><path d="M4 3v18M20 3v18M4 7h16M4 12h16M4 17h16" /><circle cx="8" cy="9.5" r="1.2" /><circle cx="12" cy="9.5" r="1.2" /><circle cx="16" cy="14.5" r="1.2" /></svg>
);
export const Warehouse = (p: P) => (
  <svg {...base(p)}><path d="M3 21V9l9-5 9 5v12" /><path d="M7 21v-8h10v8M7 17h10" /></svg>
);
export const Snow = (p: P) => (
  <svg {...base(p)}><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" /></svg>
);
export const Youtube = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z" />
  </svg>
);
export const Clock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
