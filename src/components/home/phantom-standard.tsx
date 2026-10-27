import { FileCheck2, PackageCheck, ShieldCheck } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "./section-heading";

const pillars = [
  {
    icon: ShieldCheck,
    title: "≥99% purity, every lot",
    body: "HPLC-tested by an independent third-party lab before release. If a lot misses spec, we replace it or refund it.",
  },
  {
    icon: FileCheck2,
    title: "Lot-specific COA",
    body: "A Certificate of Analysis tied to your lot ships in every box and is published in the COA library.",
  },
  {
    icon: PackageCheck,
    title: "Same-day, discreet dispatch",
    body: "Orders before 2pm ET ship the same business day in unmarked packaging. Damaged shipments are reshipped at our cost.",
  },
];

const steps = [
  { title: "Synthesis", body: "Solid-phase synthesis at a certified partner facility, traced to raw-material origin." },
  { title: "Purification", body: "Reverse-phase HPLC to ≥99% purity, with retention data archived per lot." },
  { title: "Verification", body: "An independent third-party lab confirms identity, mass and purity." },
  { title: "Lyophilization", body: "Freeze-dried, sealed and checked for fill uniformity." },
  { title: "Dispatch", body: "Packed discreetly and shipped the same day when ordered before 2pm ET." },
];

export function PhantomStandard() {
  return (
    <section className="container-page py-20 sm:py-28">
      <SectionHeading
        index="03"
        eyebrow="The Phantom standard"
        title={
          <>
            We don&apos;t ship a lot
            <br className="hidden sm:block" /> <span className="text-gradient-violet">without proof.</span>
          </>
        }
        description="Three commitments on every order, and five checkpoints between raw material and your bench."
      />

      <div className="mt-12 grid gap-3 sm:gap-4 md:grid-cols-3">
        {pillars.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <Spotlight className="h-full rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-7">
              <div className="grid size-11 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
                <p.icon className="size-5" />
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{p.body}</p>
            </Spotlight>
          </Reveal>
        ))}
      </div>

      <ol className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        <span aria-hidden="true" className="absolute top-[15px] right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent lg:block" />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <li className="relative">
              <span className="relative z-10 grid size-8 place-items-center rounded-full border border-violet-400/50 bg-ink-950 font-mono text-[11px] text-violet-300 shadow-[0_0_20px_-4px_var(--violet-500)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
