"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { enquiryTypes } from "@/lib/site";
import { deliverLead, type Lead } from "@/lib/mailer";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<FieldName, string>>;
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
  console.info("[lead]", lead.id, lead.type, emailed ? "emailed" : "stored");

  return {
    status: "success",
    message: `Thank you, ${data.name.split(" ")[0]} — your enquiry has been received${emailed ? " and a confirmation is on its way to your inbox" : ""}. We'll get back to you shortly. Reference: ${lead.id}`,
  };
}
