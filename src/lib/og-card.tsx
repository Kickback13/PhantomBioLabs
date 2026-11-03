import { ImageResponse } from "next/og";
import { site } from "./site";

export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * Generated 1200×630 share card in the house style (black, one violet accent). Used until the real
 * share images in IMAGE_SPEC.md exist. Text only: no purity numbers, lots or claims beyond the RUO line.
 */
export function ogCard({ eyebrow, title, footnote }: { eyebrow: string; title: string; footnote?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(60% 80% at 85% 40%, rgba(139,61,255,0.35), rgba(6,5,9,0) 70%), #060509",
          color: "#f7f5fb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#8b3dff" }} />
          <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase" }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#b794ff" }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 28 ? 64 : 84, lineHeight: 1.02, letterSpacing: -2, maxWidth: 960 }}>{title}</div>
        </div>
        <div style={{ fontSize: 22, color: "#a19bb3" }}>{footnote ?? site.compliance.short}</div>
      </div>
    ),
    OG_SIZE,
  );
}
