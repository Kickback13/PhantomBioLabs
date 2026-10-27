"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { mainNav, site } from "@/lib/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-xl text-foreground hover:bg-white/5"
      >
        <Menu className="size-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-ink-950/96 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-page flex h-16 items-center justify-end">
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-xl hover:bg-white/5">
                <X className="size-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="container-page mt-4 flex flex-col">
              {[{ href: "/", label: "Home" }, ...mainNav].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-line py-4 text-3xl font-semibold tracking-tight"
                  >
                    <span className="font-mono text-[11px] text-violet-400">{String(i).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="container-page absolute bottom-8 left-0 right-0">
              <p className="eyebrow">Support</p>
              <a href={site.contact.whatsappHref} className="mt-2 block text-lg">
                WhatsApp {site.contact.whatsapp}
              </a>
              <p className="text-sm text-muted">{site.contact.hours}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
