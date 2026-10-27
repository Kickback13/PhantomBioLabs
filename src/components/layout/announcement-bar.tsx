import { Marquee } from "@/components/ui/marquee";
import { getStoreSettings } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export async function AnnouncementBar() {
  const { freeShippingThresholdCents } = await getStoreSettings();
  const items = [
    `Free U.S. shipping over ${formatPrice(freeShippingThresholdCents).replace(".00", "")}`,
    "Third-party HPLC tested",
    "Same-day dispatch before 2pm ET",
    "Lot-specific COA in every box",
    "Discreet, unmarked packaging",
    "For laboratory research use only",
  ];
  return (
    <div className="relative z-40 border-b border-line bg-ink-950">
      <Marquee duration={45} gap="2.25rem" pauseOnHover className="h-9 font-mono text-[10.5px] tracking-[0.18em] text-muted uppercase">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-[2.25rem] whitespace-nowrap">
            <span>{item}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-violet-500 shadow-[0_0_8px_var(--violet-500)]" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
