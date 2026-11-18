import "server-only";
import nodemailer from "nodemailer";
import { appendFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { site, formatPhone } from "./site";

/**
 * Lead delivery.
 *
 * Configure SMTP in .env.local (Gmail example — use an App Password):
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=465
 *   SMTP_USER=consultingfarms@gmail.com
 *   SMTP_PASS=xxxx xxxx xxxx xxxx
 *   LEAD_TO_EMAIL=consultingfarms@gmail.com      (optional, defaults to site email)
 *   LEAD_BCC_EMAIL=someone@example.com           (optional blind copy of every lead)
 *   MAIL_FROM="Consulting Farms <consultingfarms@gmail.com>"   (optional)
 *
 * Every lead is ALSO appended to data/leads.jsonl as a backup, so nothing is
 * lost if email fails. (On serverless hosts use a database instead.)
 */

export type Lead = {
  id: string;
  submittedAt: string;
  status: "New";
  name: string;
  business: string;
  email: string;
  phone: string;
  type: string;
  product: string;
  quantity: string;
  area: string;
  message: string;
  estimate?: string;
  footprint: Record<string, unknown>;
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

let transport: ReturnType<typeof nodemailer.createTransport> | null | undefined;
function getTransport() {
  if (transport !== undefined) return transport;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_PREVIEW } = process.env;
  // MAIL_PREVIEW=1 → render emails to data/email-preview-*.html instead of sending (local testing)
  if (MAIL_PREVIEW === "1") return (transport = nodemailer.createTransport({ jsonTransport: true }));
  transport =
    SMTP_HOST && SMTP_USER && SMTP_PASS
      ? nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT || 465),
          secure: Number(SMTP_PORT || 465) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        })
      : null;
  return transport;
}

function row(label: string, value: unknown) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return "";
  const v = Array.isArray(value) ? value.join(" → ") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `<tr><td style="padding:8px 12px;color:#5b6b63;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eef2ea">${esc(label)}</td><td style="padding:8px 12px;color:#11201a;font-size:14px;border-bottom:1px solid #eef2ea">${esc(v)}</td></tr>`;
}

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f2f6ee;font-family:Segoe UI,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
  <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="background:#0e2a1f;padding:22px 28px;color:#ffffff;font-size:20px;font-weight:700">🍄 ${esc(site.name)} <span style="color:#b8e04a;font-weight:600">· ${esc(title)}</span></td></tr>
    <tr><td style="padding:24px 28px">${body}</td></tr>
    <tr><td style="background:#fbfcf9;padding:16px 28px;color:#7a877f;font-size:12px">${esc(site.legalName)} · ${esc(`${site.address.office}, ${site.address.area}, ${site.address.city}, UAE`)} · ${esc(formatPhone(site.phone))}</td></tr>
  </table></td></tr></table></body></html>`;
}

function businessEmail(l: Lead) {
  const f = l.footprint as Record<string, unknown>;
  const campaign = (f.campaign ?? {}) as Record<string, string>;
  const body = `
  <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0e2a1f">New lead: ${esc(l.type)}</p>
  <p style="margin:0 0 18px;color:#5b6b63;font-size:14px">Lead ID ${esc(l.id)} · ${esc(new Date(l.submittedAt).toUTCString())}</p>
  <p style="margin:0 0 18px">
    <a href="mailto:${esc(l.email)}" style="background:#0e2a1f;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-size:14px;margin-right:6px">Reply by email</a>
    <a href="https://wa.me/${esc(l.phone.replace(/[^\d]/g, ""))}" style="background:#25d366;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;font-size:14px">WhatsApp</a>
  </p>
  <h3 style="margin:18px 0 6px;color:#2f8f4e;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Contact</h3>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${row("Name", l.name)}${row("Business", l.business)}${row("Email", l.email)}${row("Phone / WhatsApp", l.phone)}
    ${row("Enquiry type", l.type)}${row("Product", l.product)}${row("Quantity", l.quantity)}${row("Delivery area", l.area)}
  </table>
  <h3 style="margin:18px 0 6px;color:#2f8f4e;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Message</h3>
  <p style="white-space:pre-wrap;background:#f6f9f3;border-radius:10px;padding:12px 14px;color:#11201a;font-size:14px;margin:0">${esc(l.message)}</p>
  ${l.estimate ? `<h3 style="margin:18px 0 6px;color:#2f8f4e;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Calculator estimate</h3><pre style="white-space:pre-wrap;background:#0e2a1f;color:#e9f5df;border-radius:10px;padding:12px 14px;font-size:13px;margin:0">${esc(l.estimate)}</pre>` : ""}
  <h3 style="margin:18px 0 6px;color:#2f8f4e;font-size:13px;text-transform:uppercase;letter-spacing:.08em">Lead footprint</h3>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${row("Source / referrer", f.referrer)}${row("Landing page", f.landingPage)}${row("Submitted from", f.submittedFrom)}
    ${row("UTM source", campaign.utm_source)}${row("UTM medium", campaign.utm_medium)}${row("UTM campaign", campaign.utm_campaign)}${row("UTM term", campaign.utm_term)}
    ${row("Google Ads click", campaign.gclid)}${row("Meta click", campaign.fbclid)}
    ${row("First visit", f.firstSeen)}${row("Page views", f.pageviews)}${row("Time on site", f.timeOnSiteSec ? `${Math.round(Number(f.timeOnSiteSec) / 60)} min ${Number(f.timeOnSiteSec) % 60}s` : "")}
    ${row("Journey", f.journey)}${row("Device", f.device)}${row("Screen", f.screen)}${row("Language", f.language)}${row("Timezone", f.timezone)}
    ${row("Country (edge)", f.country)}${row("IP", f.ip)}${row("Browser", f.userAgent)}
  </table>`;
  return shell("New enquiry", body);
}

function visitorEmail(l: Lead) {
  const body = `
  <p style="font-size:18px;color:#0e2a1f;margin:0 0 12px">Hi ${esc(l.name.split(" ")[0])},</p>
  <p style="color:#33433b;font-size:15px;line-height:1.6;margin:0 0 12px">Thank you for contacting ${esc(site.name)}. We've received your enquiry about <strong>${esc(l.type.toLowerCase())}</strong> and a member of our team will get back to you shortly — usually within one working day.</p>
  ${l.estimate ? `<p style="color:#33433b;font-size:15px;margin:16px 0 6px">Here's a copy of your indicative estimate:</p><pre style="white-space:pre-wrap;background:#f6f9f3;border-radius:10px;padding:12px 14px;font-size:13px;color:#11201a;margin:0">${esc(l.estimate)}</pre><p style="color:#7a877f;font-size:12px;margin:6px 0 0">Indicative only — not a quotation. Final pricing depends on site survey, specification and supplier rates.</p>` : ""}
  <p style="color:#33433b;font-size:15px;line-height:1.6;margin:18px 0 0">Need us sooner? WhatsApp or call <a href="https://wa.me/${esc(site.whatsapp)}" style="color:#2f8f4e">${esc(formatPhone(site.phone))}</a> — ${esc(site.hours)}.</p>
  <p style="color:#33433b;font-size:15px;margin:18px 0 0">— The ${esc(site.name)} team</p>
  <p style="color:#9aa69f;font-size:12px;margin:18px 0 0">Your reference: ${esc(l.id)}</p>`;
  return shell("We received your enquiry", body);
}

async function backup(l: Lead) {
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(l) + "\n", "utf8");
  } catch (e) {
    console.error("[lead] backup failed", e);
  }
}

/** Stores the lead and emails the business + an acknowledgement to the visitor. */
export async function deliverLead(l: Lead): Promise<{ emailed: boolean }> {
  await backup(l);
  const t = getTransport();
  if (!t) {
    console.warn("[lead] SMTP not configured — lead saved to data/leads.jsonl only:", l.id);
    return { emailed: false };
  }
  const from = process.env.MAIL_FROM || `${site.name} <${process.env.SMTP_USER}>`;
  const to = process.env.LEAD_TO_EMAIL || site.email;
  try {
    const sent = await t.sendMail({
      from,
      to,
      replyTo: `${l.name} <${l.email}>`,
      bcc: process.env.LEAD_BCC_EMAIL || undefined,
      subject: `🍄 New lead · ${l.type} · ${l.name}${l.business ? ` (${l.business})` : ""}`,
      html: businessEmail(l),
      text: `New lead ${l.id}\n${l.name} <${l.email}> ${l.phone}\n${l.type} · ${l.product}\n\n${l.message}\n\n${l.estimate ?? ""}\n\nFootprint:\n${JSON.stringify(l.footprint, null, 2)}`,
    });
    if (process.env.MAIL_PREVIEW === "1") {
      const msg = JSON.parse(String(sent.message)) as { html?: string };
      const dir = path.join(process.cwd(), "data");
      await writeFile(path.join(dir, `email-preview-${l.id}-business.html`), msg.html ?? "", "utf8");
      await writeFile(path.join(dir, `email-preview-${l.id}-visitor.html`), visitorEmail(l), "utf8");
    }
    // Acknowledgement is best-effort
    t.sendMail({
      from,
      to: l.email,
      replyTo: to,
      subject: `We received your enquiry — ${site.name}`,
      html: visitorEmail(l),
    }).catch((e: unknown) => console.error("[lead] acknowledgement failed", e));
    return { emailed: true };
  } catch (e) {
    console.error("[lead] email failed — lead kept in backup", e);
    return { emailed: false };
  }
}
