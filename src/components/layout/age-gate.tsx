import { BorderBeam } from "@/components/ui/border-beam";
import { GhostMark } from "@/components/brand/logo";
import { site } from "@/lib/site";
import { AgeGateActions } from "./age-gate-actions";

export const AGE_GATE_KEY = "pbl-age-confirmed-v1";

/** Runs in <head> before paint, so returning visitors never see the gate flash. */
export const ageGateScript = `try{if(localStorage.getItem("${AGE_GATE_KEY}"))document.documentElement.setAttribute("data-age-ok","")}catch(e){}`;

/** Shown on first visit. Hidden by CSS once html[data-age-ok] is set. */
export function AgeGate() {
  return (
    <div data-age-gate className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/90 p-4 backdrop-blur-xl sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line-strong bg-ink-900 p-6 shadow-[0_40px_120px_-20px_rgba(139,61,255,0.35)] sm:p-8"
      >
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-64 rounded-full bg-violet-500/25 blur-3xl" />
        <BorderBeam size={180} duration={9} />
        <div className="relative">
          <GhostMark className="size-9 text-violet-400" />
          <p className="eyebrow mt-6">Research use only · 21+</p>
          <h2 id="age-gate-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Before you enter
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {site.name} supplies compounds strictly for in-vitro laboratory research. They are not for human or animal consumption, and nothing on this site is intended to diagnose, treat, cure or prevent any disease.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {["I am 21 years of age or older.", "I am a qualified researcher or represent a research institution.", "I will use these materials for laboratory research only."].map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-violet-400" />
                <span className="text-ink-200">{line}</span>
              </li>
            ))}
          </ul>
          <AgeGateActions storageKey={AGE_GATE_KEY} />
        </div>
      </div>
    </div>
  );
}
