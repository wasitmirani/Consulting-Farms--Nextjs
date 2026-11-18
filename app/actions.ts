"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { enquiryTypes } from "@/lib/site";
import { deliverLead, type Lead } from "@/lib/mailer";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<FieldName, string>>;
  /** When SMTP isn't configured: payload the browser relays to Web3Forms (free plan = client-side only). */
  relay?: { id: string; keys: string[]; fields: Record<string, string> };
};

type FieldName =
  | "name"
  | "business"
  | "email"
  | "phone"
  | "type"
  | "product"
  | "quantity"
  | "area"
  | "message"
  | "consent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

// Basic in-memory rate limit (per server instance). Swap for Redis/DB in production.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("company_website") ?? "").trim() !== "") {
    return { status: "success", message: "Thank you — we'll be in touch shortly." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return {
      status: "error",
      message: "Too many enquiries from this connection. Please try again in a few minutes.",
    };
  }

  const get = (k: FieldName) => String(formData.get(k) ?? "").trim();
  const data = {
    name: get("name"),
    business: get("business"),
    email: get("email"),
    phone: get("phone"),
    type: get("type"),
    product: get("product"),
    quantity: get("quantity"),
    area: get("area"),
    message: get("message"),
    consent: formData.get("consent") === "on",
  };

  const errors: EnquiryState["errors"] = {};
  if (data.name.length < 2) errors.name = "Please enter your full name.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email address.";
  if (!PHONE_RE.test(data.phone)) errors.phone = "Please enter a valid phone or WhatsApp number.";
  if (!(enquiryTypes as readonly string[]).includes(data.type)) errors.type = "Please choose an enquiry type.";
  if (data.message.length < 10) errors.message = "Please tell us a little more (at least 10 characters).";
  if (data.message.length > 3000) errors.message = "Please keep your message under 3000 characters.";
  if (!data.consent) errors.consent = "Please confirm we may contact you about this enquiry.";

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  recent.push(now);
  hits.set(ip, recent);

  // Footprint + calculator estimate come from hidden fields; parse defensively.
  const parseJson = (k: string, max: number): Record<string, unknown> => {
    const raw = String(formData.get(k) ?? "");
    if (!raw || raw.length > max) return {};
    try {
      const v = JSON.parse(raw);
      return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch {
      return {};
    }
  };
  const estimate = String(formData.get("estimate") ?? "").slice(0, 2500) || undefined;

  const lead: Lead = {
    id: `CF-${now.toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`,
    submittedAt: new Date(now).toISOString(),
    status: "New",
    ...data,
    estimate,
    footprint: {
      ...parseJson("footprint", 5000),
      ip,
      country: h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "",
      userAgent: (h.get("user-agent") ?? "").slice(0, 300),
      pageReferer: h.get("referer") ?? "",
    },
  };

  const { emailed } = await deliverLead(lead);

  // Free email delivery via Web3Forms when SMTP isn't set up. Each access key
  // delivers to the inbox it was created for, so a second key acts as a BCC.
  const keys = [
    process.env.WEB3FORMS_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
    process.env.WEB3FORMS_BCC_ACCESS_KEY || process.env.NEXT_PUBLIC_WEB3FORMS_BCC_ACCESS_KEY,
  ].filter(
    (k): k is string => !!k && /^[0-9a-f-]{36}$/i.test(k.trim()),
  ).map((k) => k.trim());
  const relay = !emailed && keys.length ? { id: lead.id, keys, fields: web3formsFields(lead) } : undefined;
  console.info("[lead]", lead.id, lead.type, emailed ? "emailed (SMTP)" : relay ? "relaying via Web3Forms" : "stored only");

  return {
    status: "success",
    message: `Thank you, ${data.name.split(" ")[0]} — your enquiry has been received${emailed ? " and a confirmation is on its way to your inbox" : ""}. We'll get back to you shortly. Reference: ${lead.id}`,
    relay,
  };
}

/** Flat, labelled fields — Web3Forms emails them as a table, in this order. */
function web3formsFields(l: Lead): Record<string, string> {
  const f = l.footprint as Record<string, unknown>;
  const c = (f.campaign ?? {}) as Record<string, string>;
  const t = Number(f.timeOnSiteSec ?? 0);
  const out: Record<string, string | undefined> = {
    subject: `🍄 New lead · ${l.type} · ${l.name}${l.business ? ` (${l.business})` : ""}`,
    from_name: "Consulting Farms Website",
    email: l.email, // reply-to
    "Lead ID": l.id,
    Name: l.name,
    Business: l.business,
    "Phone / WhatsApp": l.phone,
    "WhatsApp link": `https://wa.me/${l.phone.replace(/[^\d]/g, "")}`,
    "Enquiry type": l.type,
    Product: l.product,
    Quantity: l.quantity,
    "Delivery area": l.area,
    Message: l.message,
    "Calculator estimate": l.estimate,
    "— Lead footprint —": "",
    "Source / referrer": String(f.referrer ?? ""),
    "Landing page": String(f.landingPage ?? ""),
    "Submitted from": String(f.submittedFrom ?? ""),
    "UTM source": c.utm_source,
    "UTM medium": c.utm_medium,
    "UTM campaign": c.utm_campaign,
    "UTM term": c.utm_term,
    "Google Ads click (gclid)": c.gclid,
    "Meta click (fbclid)": c.fbclid,
    "First visit": String(f.firstSeen ?? ""),
    "Page views": f.pageviews ? String(f.pageviews) : "",
    "Time on site": t ? `${Math.floor(t / 60)} min ${t % 60}s` : "",
    Journey: Array.isArray(f.journey) ? f.journey.join(" → ") : "",
    Device: `${f.device ?? ""} · ${f.screen ?? ""}`,
    Language: String(f.language ?? ""),
    Timezone: String(f.timezone ?? ""),
    Country: String(f.country ?? ""),
    IP: String(f.ip ?? ""),
    Browser: String(f.userAgent ?? ""),
    "Submitted at": new Date(l.submittedAt).toUTCString(),
  };
  return Object.fromEntries(Object.entries(out).filter(([k, v]) => v || k.startsWith("—")).map(([k, v]) => [k, v ?? ""]));
}
