import { ImageResponse } from "next/og";
import { siteConfig } from "@/config";

export const runtime = "edge";
export const alt = siteConfig.companyName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamically generated default Open Graph image for the site. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a1226 0%, #12245a 100%)",
          padding: 80,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {siteConfig.companyName.charAt(0)}
          </div>
          <div style={{ fontSize: 30, fontWeight: 600 }}>
            {siteConfig.companyName}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            {siteConfig.tagline}
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#93c5fd" }}>
            {siteConfig.address.city}, {siteConfig.address.state} ·{" "}
            {siteConfig.industry}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
