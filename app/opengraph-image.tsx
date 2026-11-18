import { ImageResponse } from "next/og";

export const alt = "Consulting Farms — Mushroom farming & greenhouse consulting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0e2a1f 0%, #07190f 100%)",
          color: "#f2f6ee",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#f2f6ee", display: "flex" }} />
          Consulting Farms
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -2 }}>Grown with care.</div>
          <div style={{ fontSize: 84, lineHeight: 1.05, letterSpacing: -2, color: "#b8e04a", fontStyle: "italic" }}>
            Farmed with know-how.
          </div>
        </div>
        <div style={{ fontSize: 30, color: "rgba(246,241,230,0.7)" }}>
          Mushroom farming · Greenhouse management · Wholesale supply
        </div>
      </div>
    ),
    size,
  );
}
