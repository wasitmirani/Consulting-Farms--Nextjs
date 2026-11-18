"use client";

import { useEffect, useRef, useState } from "react";
import type { EnquiryState } from "@/app/actions";

export type RelayStatus = "idle" | "sending" | "sent" | "failed";

/**
 * Sends a validated lead to Web3Forms from the browser (the free plan only
 * accepts client-side submissions). One POST per access key — the second key
 * delivers a blind copy to another inbox. Runs once per lead ID.
 */
export function useLeadRelay(state: EnquiryState): RelayStatus {
  const [status, setStatus] = useState<RelayStatus>("idle");
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    const relay = state.status === "success" ? state.relay : undefined;
    if (!relay || sentFor.current === relay.id) return;
    sentFor.current = relay.id;
    setStatus("sending");

    Promise.allSettled(
      relay.keys.map((access_key) =>
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key, botcheck: "", ...relay.fields }),
        }).then(async (r) => {
          const j = (await r.json().catch(() => ({}))) as { success?: boolean; message?: string };
          if (!r.ok || !j.success) throw new Error(j.message || `HTTP ${r.status}`);
        }),
      ),
    ).then((results) => {
      results.forEach((r, i) => r.status === "rejected" && console.warn(`[lead] Web3Forms key #${i + 1} failed:`, r.reason));
      // The first key is the business inbox — that's the one that matters.
      setStatus(results[0]?.status === "fulfilled" ? "sent" : "failed");
    });
  }, [state]);

  return status;
}
