import { Check, Minus } from "lucide-react";
import { getStoreSettings } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

export async function Comparison() {
  const { freeShippingThresholdCents } = await getStoreSettings();
  const rows: [string, string][] = [
    ["Independent third-party COA for every lot", "Varies"],
    ["≥99% purity specification", "Varies"],
    ["Same-day dispatch before 2pm ET", "Rare"],
    ["U.S.-based fulfilment", "Sometimes"],
    [`Free U.S. shipping over ${formatPrice(freeShippingThresholdCents).replace(".00", "")}`, "Rare"],
    ["Age and research-use verification", "Weak"],
  ];
  return (
    <section className="container-page py-20 sm:py-28">
      <SectionHeading index="05" eyebrow="How we compare" title="Built for researchers who check." />
      <div className="mt-10 overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm sm:text-[15px]">
          <thead>
            <tr className="border-b border-line bg-surface">
              <th scope="col" className="p-4 font-normal text-muted sm:p-5">
                <span className="sr-only">Feature</span>
              </th>
              <th scope="col" className="w-28 bg-violet-500/10 p-4 text-center font-semibold sm:w-44 sm:p-5">
                Phantom
              </th>
              <th scope="col" className="w-24 p-4 text-center font-normal text-muted sm:w-40 sm:p-5">
                Typical supplier
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([feature, other]) => (
              <tr key={feature} className="border-b border-line last:border-0">
                <th scope="row" className="p-4 font-normal sm:p-5">
                  {feature}
                </th>
                <td className="bg-violet-500/[0.06] p-4 text-center sm:p-5">
                  <Check className="mx-auto size-4 text-violet-300" aria-label="Yes" />
                </td>
                <td className="p-4 text-center text-muted sm:p-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Minus className="size-3 text-subtle" aria-hidden="true" />
                    {other}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
