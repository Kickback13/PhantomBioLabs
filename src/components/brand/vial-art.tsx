import { cn } from "@/lib/utils";

/**
 * Placeholder vial drawn in SVG, labelled with the product and size. Shown until the real
 * product photo is added under public/images (see IMAGE_SPEC.md).
 */
export function VialArt({
  name,
  size,
  className,
  glow = true,
  id,
}: {
  name: string;
  size?: string;
  className?: string;
  glow?: boolean;
  /** Unique per page, so gradient ids don't collide. */
  id: string;
}) {
  const g = (k: string) => `${id}-${k}`;
  const lines = splitName(name);
  const nameSize = lines.length > 1 ? 15 : name.length > 9 ? 16 : name.length > 6 ? 19 : 22;

  return (
    <svg viewBox="0 0 240 440" className={cn("h-full w-auto", className)} role="img" aria-label={`${name}${size ? ` ${size}` : ""} vial`}>
      <defs>
        <radialGradient id={g("glow")} cx="50%" cy="58%" r="50%">
          <stop offset="0%" stopColor="#8b3dff" stopOpacity="0.55" />
          <stop offset="45%" stopColor="#8b3dff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#8b3dff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("metal")} x1="0" x2="1">
          <stop offset="0" stopColor="#17141f" />
          <stop offset="0.35" stopColor="#5d5670" />
          <stop offset="0.55" stopColor="#9c95ae" />
          <stop offset="0.75" stopColor="#3b354b" />
          <stop offset="1" stopColor="#15121d" />
        </linearGradient>
        <linearGradient id={g("flip")} x1="0" x2="1">
          <stop offset="0" stopColor="#4a12a8" />
          <stop offset="0.5" stopColor="#a97bff" />
          <stop offset="1" stopColor="#3d0d8c" />
        </linearGradient>
        <linearGradient id={g("glass")} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.12" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="0.88" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={g("label")} x1="0" x2="1">
          <stop offset="0" stopColor="#b9b3c8" />
          <stop offset="0.14" stopColor="#efecf5" />
          <stop offset="0.5" stopColor="#f8f6fc" />
          <stop offset="0.86" stopColor="#e6e2ef" />
          <stop offset="1" stopColor="#a8a1b8" />
        </linearGradient>
        <linearGradient id={g("powder")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f1fa" />
          <stop offset="1" stopColor="#cfc8de" />
        </linearGradient>
        <clipPath id={g("body")}>
          <rect x="52" y="118" width="136" height="292" rx="24" />
        </clipPath>
      </defs>

      {glow && <ellipse cx="120" cy="250" rx="120" ry="190" fill={`url(#${g("glow")})`} />}
      <ellipse cx="120" cy="424" rx="74" ry="9" fill="#000" opacity="0.55" />

      {/* cap */}
      <rect x="72" y="20" width="96" height="22" rx="7" fill={`url(#${g("flip")})`} />
      <rect x="66" y="38" width="108" height="50" rx="9" fill={`url(#${g("metal")})`} />
      <rect x="66" y="80" width="108" height="16" rx="5" fill={`url(#${g("metal")})`} opacity="0.85" />
      {/* neck */}
      <path d="M84 96h72v10c0 6 32 6 32 22H52c0-16 32-16 32-22V96Z" fill={`url(#${g("glass")})`} stroke="#fff" strokeOpacity="0.18" />

      {/* body */}
      <rect x="52" y="118" width="136" height="292" rx="24" fill="#0f0d15" fillOpacity="0.55" />
      <g clipPath={`url(#${g("body")})`}>
        <path d="M52 352c22-8 44 6 68 0s46-8 68 2v58H52Z" fill={`url(#${g("powder")})`} opacity="0.92" />
        {/* label */}
        <rect x="52" y="176" width="136" height="150" fill={`url(#${g("label")})`} />
        <rect x="52" y="176" width="136" height="22" fill="#0b0a10" />
        <text x="120" y="191" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="7.5" letterSpacing="2.4" fill="#c6a8ff">
          PHANTOM BIO LABS
        </text>
        {lines.map((line, i) => (
          <text
            key={line}
            x="120"
            y={(lines.length > 1 ? 232 : 244) + i * (nameSize + 3)}
            textAnchor="middle"
            fontFamily="var(--font-geist-sans), sans-serif"
            fontWeight="700"
            fontSize={nameSize}
            letterSpacing="-0.3"
            fill="#0b0a10"
          >
            {line}
          </text>
        ))}
        {size && (
          <text x="120" y="282" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="11" letterSpacing="1.5" fill="#5a16c4">
            {size.toUpperCase()}
          </text>
        )}
        <line x1="72" x2="168" y1="296" y2="296" stroke="#0b0a10" strokeOpacity="0.15" />
        <text x="120" y="312" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="6" letterSpacing="1.4" fill="#3b354b">
          RESEARCH USE ONLY
        </text>
        <rect x="52" y="118" width="136" height="292" fill={`url(#${g("glass")})`} />
        <rect x="62" y="128" width="9" height="270" rx="4.5" fill="#fff" opacity="0.14" />
        <rect x="170" y="140" width="4" height="240" rx="2" fill="#fff" opacity="0.08" />
      </g>
      <rect x="52" y="118" width="136" height="292" rx="24" fill="none" stroke="#fff" strokeOpacity="0.2" />
    </svg>
  );
}

function splitName(name: string): string[] {
  if (name.length <= 12) return [name];
  const words = name.split(" ");
  if (words.length < 2) return [name];
  let best = [name];
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) {
      best = [a, b];
      bestDiff = diff;
    }
  }
  return best;
}
