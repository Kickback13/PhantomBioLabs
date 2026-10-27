"use client";

import { Button } from "@/components/ui/button";

export function AgeGateActions({ storageKey }: { storageKey: string }) {
  function confirm() {
    try {
      localStorage.setItem(storageKey, new Date().toISOString());
    } catch {
      // Private mode: the gate will show again next visit, which is fine.
    }
    document.documentElement.setAttribute("data-age-ok", "");
    document.body.style.overflow = "";
  }

  return (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <Button size="lg" className="sm:flex-1" onClick={confirm} autoFocus>
        I confirm, enter site
      </Button>
      <Button size="lg" variant="outline" asChild className="sm:w-36">
        <a href="https://www.google.com">Exit</a>
      </Button>
    </div>
  );
}
