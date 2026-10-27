import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { VialArt } from "@/components/brand/vial-art";
import { AnimatedGrid } from "@/components/ui/animated-grid";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal } from "@/components/ui/reveal";
import { heroImage } from "@/lib/images";
import { site } from "@/lib/site";

const stats = [
  { value: <><NumberTicker value={99} />%+</>, label: "Purity, every lot" },
  { value: "HPLC", label: "Third-party tested" },
  { value: "Same day", label: "Dispatch before 2pm ET" },
  { value: "Discreet", label: "Unmarked packaging" },
];

export function Hero() {
  const photo = heroImage();
  return (
    <section className="grain relative isolate overflow-hidden border-b border-line">
      <AnimatedGrid className="-z-10" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950 to-transparent" />

      <div className="container-page grid items-center gap-6 pt-6 pb-12 lg:min-h-[calc(100dvh-100px)] lg:grid-cols-[1.2fr_0.8fr] lg:gap-8 lg:py-16">
        {/* Visual first on phones, right column on desktop */}
        <div className="relative order-first mx-auto h-[260px] w-full max-w-[420px] sm:h-[420px] lg:order-last lg:h-[620px] lg:max-w-none">
          <HeroVisual photo={photo} />
        </div>

        <div className="relative">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 font-mono text-[10.5px] tracking-[0.16em] text-violet-200 uppercase">
              <span className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_var(--violet-400)]" />
              Independently third-party tested
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 text-[2.6rem] leading-[0.95] font-semibold tracking-[-0.045em] sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]">
              Research-grade peptides.
              <br />
              <span className="text-gradient-violet">Zero compromise.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Every lot HPLC-tested to ≥99% purity by an independent lab, documented with a lot-specific Certificate of Analysis, and dispatched the same day.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop">
                Shop the catalog <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/coa">
                <FileCheck2 /> Browse COAs
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.24}>
            <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-ink-950/50 backdrop-blur sm:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={[
                    "flex flex-col gap-1 p-4 sm:p-5",
                    i % 2 === 1 ? "border-l border-line" : "",
                    i >= 2 ? "border-t border-line sm:border-t-0" : "",
                    i >= 1 ? "sm:border-l" : "",
                  ].join(" ")}
                >
                  <dt className="order-last text-[11.5px] leading-snug text-muted">{s.label}</dt>
                  <dd className="text-xl font-semibold tracking-tight sm:text-2xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <p className="mt-5 font-mono text-[10.5px] tracking-[0.14em] text-subtle uppercase">{site.compliance.short}</p>
        </div>
      </div>
    </section>
  );
}

function HeroVisual({ photo }: { photo: string | null }) {
  return (
    <div className="relative h-full w-full">
      <div aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--violet-500)_45%,transparent)_0%,transparent_62%)] blur-2xl motion-safe:animate-pulse-ring" />
      <OrbitRing />
      <div className="absolute inset-0 flex items-center justify-center motion-safe:animate-float">
        {photo ? (
          <Image src={photo} alt="Phantom Bio Labs research vial" fill preload sizes="(min-width: 1024px) 45vw, 90vw" className="object-contain" />
        ) : (
          <div className="h-[86%]">
            <VialArt id="hero" name="PHANTOM" size="≥99% HPLC" />
          </div>
        )}
      </div>
      <FloatingChip className="top-[12%] left-0 lg:left-[2%]" label="Purity (HPLC)" value="≥ 99.0%" />
      <FloatingChip className="top-[44%] right-0 lg:right-[1%]" label="Certificate" value="Lot-specific COA" delay="1.2s" />
      <FloatingChip className="bottom-[10%] left-[4%] max-sm:hidden lg:left-[8%]" label="Format" value="Lyophilized · sealed" delay="2.4s" />
      {!photo && (
        <span className="absolute right-2 bottom-0 font-mono text-[9px] tracking-[0.2em] text-ink-500">PLACEHOLDER · SEE IMAGE_SPEC</span>
      )}
    </div>
  );
}

function FloatingChip({ label, value, className, delay = "0s" }: { label: string; value: string; className?: string; delay?: string }) {
  return (
    <div
      className={`absolute z-10 rounded-xl border border-line-strong bg-ink-900/70 px-2.5 py-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md motion-safe:animate-float sm:px-3 sm:py-2 ${className}`}
      style={{ animationDelay: delay }}
    >
      <p className="font-mono text-[8px] tracking-[0.18em] text-muted uppercase sm:text-[9px]">{label}</p>
      <p className="mt-0.5 text-[12px] font-medium tracking-tight sm:text-[13px]">{value}</p>
    </div>
  );
}

function OrbitRing() {
  const text = "THIRD-PARTY VERIFIED · HPLC ≥99% · LOT-TESTED · COA IN EVERY BOX · ";
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className="absolute top-1/2 left-1/2 aspect-square w-[96%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 text-violet-300/70 motion-safe:animate-[spin_60s_linear_infinite]">
      <defs>
        <path id="orbit" d="M200,200 m-170,0 a170,170 0 1,1 340,0 a170,170 0 1,1 -340,0" />
      </defs>
      <circle cx="200" cy="200" r="186" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeDasharray="2 6" />
      <circle cx="200" cy="200" r="154" fill="none" stroke="currentColor" strokeOpacity="0.1" />
      <text fontFamily="var(--font-geist-mono), monospace" fontSize="10.5" letterSpacing="3.2" fill="currentColor">
        <textPath href="#orbit">{text + text}</textPath>
      </text>
    </svg>
  );
}
