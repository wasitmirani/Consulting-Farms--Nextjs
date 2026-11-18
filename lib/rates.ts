import "server-only";
import { cacheLife } from "next/cache";
import { CURRENCIES, FALLBACK_RATES, type CurrencyCode, type Rates } from "./currency";

/**
 * Daily exchange rates (base AED) from the free, key-less ExchangeRate-API
 * open endpoint. Fetched on the server and cached for a day, so visitors never
 * call a third party and pages stay prerendered. Falls back to the snapshot.
 * Attribution is shown in the calculator, as the free tier's terms require.
 */
export async function getRates(): Promise<Rates> {
  "use cache";
  cacheLife("days");
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AED", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { result: string; rates: Record<string, number>; time_last_update_utc: string };
    if (data.result !== "success") throw new Error("bad payload");
    const rates = { ...FALLBACK_RATES.rates };
    CURRENCIES.forEach((c) => {
      const v = data.rates[c.code];
      if (typeof v === "number" && v > 0) rates[c.code as CurrencyCode] = v;
    });
    return { rates, updated: new Date(data.time_last_update_utc).toISOString().slice(0, 10), live: true };
  } catch (e) {
    console.warn("[rates] using fallback rates:", e);
    return FALLBACK_RATES;
  }
}
