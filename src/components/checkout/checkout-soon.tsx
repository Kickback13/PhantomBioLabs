import { Clock } from "lucide-react";
import { WhatsAppCta } from "@/components/content/whatsapp-cta";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Shown instead of the checkout button and form while no payment processor is connected. */
export function CheckoutSoon({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-violet-400/25 bg-violet-500/[0.06] text-center", compact ? "p-4" : "p-8 sm:p-10", className)}>
      <Clock aria-hidden="true" className={cn("mx-auto text-violet-300", compact ? "size-5" : "size-7")} />
      <p className={cn("font-semibold tracking-tight", compact ? "mt-2 text-[15px]" : "mt-4 text-xl sm:text-2xl")}>Checkout opens soon.</p>
      <p className={cn("text-muted", compact ? "mt-1 text-[13px]" : "mx-auto mt-2 max-w-md text-[15px]")}>
        Online payments are being set up. Your cart is saved on this device. Questions? Message us on WhatsApp at {site.contact.whatsapp}, {site.contact.hours}.
      </p>
      <WhatsAppCta size={compact ? "sm" : "lg"} variant="outline" label="Message us on WhatsApp" className={compact ? "mt-3 w-full" : "mt-6"} />
    </div>
  );
}
