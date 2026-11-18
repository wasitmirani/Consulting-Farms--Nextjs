/**
 * Currencies for the cost calculator. All calculator maths is done in AED
 * (base); values are converted only for display.
 *
 * `fallback` = units of the currency per 1 AED (snapshot 18 Nov 2026), used
 * if the live daily rates can't be fetched. GCC currencies are USD-pegged.
 */
export const CURRENCIES = [
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪", fallback: 1 },
  { code: "USD", name: "US Dollar", flag: "🇺🇸", fallback: 0.272294 },
  { code: "EUR", name: "Euro", flag: "🇪🇺", fallback: 0.24756 },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", fallback: 0.206278 },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", fallback: 1.021103 },
  { code: "QAR", name: "Qatari Riyal", flag: "🇶🇦", fallback: 0.99115 },
  { code: "OMR", name: "Omani Rial", flag: "🇴🇲", fallback: 0.104696 },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼", fallback: 0.084777 },
  { code: "BHD", name: "Bahraini Dinar", flag: "🇧🇭", fallback: 0.102383 },
  { code: "PKR", name: "Pakistani Rupee", flag: "🇵🇰", fallback: 75.317793 },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳", fallback: 25.463946 },
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬", fallback: 14.627492 },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷", fallback: 13.73591 },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳", fallback: 1.818887 },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦", fallback: 0.389193 },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺", fallback: 0.404183 },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export type Rates = { rates: Record<CurrencyCode, number>; updated: string; live: boolean };

export const FALLBACK_RATES: Rates = {
  rates: Object.fromEntries(CURRENCIES.map((c) => [c.code, c.fallback])) as Record<CurrencyCode, number>,
  updated: "2026-11-18",
  live: false,
};

export const isCurrency = (c: string): c is CurrencyCode => CURRENCIES.some((x) => x.code === c);

/** Round to ~3 significant figures so converted estimates don't look falsely precise. */
function nice(n: number) {
  if (n === 0) return 0;
  const p = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.abs(n))) - 2));
  return Math.round(n / p) * p;
}

const formatters = new Map<string, Intl.NumberFormat>();
export function formatMoney(amountAED: number, code: CurrencyCode = "AED", rates: Rates = FALLBACK_RATES) {
  const value = code === "AED" ? amountAED : nice(amountAED * (rates.rates[code] ?? 1));
  let f = formatters.get(code);
  if (!f) {
    f = new Intl.NumberFormat("en", { style: "currency", currency: code, currencyDisplay: "symbol", maximumFractionDigits: 0 });
    formatters.set(code, f);
  }
  return f.format(value);
}

/** Best guess of a visitor's currency from their time zone (they can change it). */
export function guessCurrency(): CurrencyCode {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, CurrencyCode> = {
      "Asia/Dubai": "AED", "Asia/Riyadh": "SAR", "Asia/Qatar": "QAR", "Asia/Kuwait": "KWD", "Asia/Muscat": "OMR",
      "Asia/Bahrain": "BHD", "Asia/Karachi": "PKR", "Asia/Kolkata": "INR", "Asia/Calcutta": "INR", "Africa/Cairo": "EGP",
      "Europe/London": "GBP", "Europe/Istanbul": "TRY", "Asia/Shanghai": "CNY", "America/Toronto": "CAD", "America/Vancouver": "CAD",
    };
    if (map[tz]) return map[tz];
    if (tz.startsWith("Australia/")) return "AUD";
    if (tz.startsWith("America/")) return "USD";
    if (tz.startsWith("Europe/")) return "EUR";
  } catch {
    /* ignore */
  }
  return "AED";
}
