import type { Metadata } from "next";
import { Clock, PackageCheck, Truck } from "lucide-react";
import { PolicyLayout } from "@/components/content/policy-layout";
import { ProseSection } from "@/components/layout/prose";
import { getStoreSettings } from "@/lib/catalog";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Dispatch times, carriers, free U.S. shipping, international delivery, damaged shipments and returns at Phantom Bio Labs.",
};

const sections = [
  { id: "dispatch", title: "Dispatch times" },
  { id: "carriers", title: "Carriers and tracking" },
  { id: "costs", title: "Shipping costs" },
  { id: "packaging", title: "Packaging" },
  { id: "international", title: "International orders" },
  { id: "damaged", title: "Damaged or defective items" },
  { id: "returns", title: "Returns" },
  { id: "address", title: "Address problems" },
];

export default async function ShippingPage() {
  const { freeShippingThresholdCents, flatShippingCents } = await getStoreSettings();
  const threshold = formatPrice(freeShippingThresholdCents).replace(".00", "");
  const highlights = [
    { icon: Clock, title: "Before 2pm ET", body: "Ships the same business day" },
    { icon: Truck, title: `Free over ${threshold}`, body: "U.S. orders, standard shipping" },
    { icon: PackageCheck, title: "Discreet", body: "Unmarked, sealed packaging" },
  ];
  return (
    <PolicyLayout
      active="/shipping"
      eyebrow="Policies"
      title="Shipping & Returns"
      intro="How and when your order ships, what it costs, and what happens if something arrives damaged."
      sections={sections}
    >
      <ul className="!mt-0 !pl-0 grid gap-3 sm:grid-cols-3">
        {highlights.map((h) => (
          <li key={h.title} className="!list-none rounded-2xl border border-line bg-surface p-5">
            <h.icon className="size-5 text-violet-300" />
            <p className="mt-4 font-semibold tracking-tight text-foreground">{h.title}</p>
            <p className="!mt-1 text-sm text-muted">{h.body}</p>
          </li>
        ))}
      </ul>
      <div className="h-6" />
      <ProseSection id="dispatch" index={1} title="Dispatch times">
        <p>
          Orders placed and paid before 2pm ET on a business day are dispatched the same day. Orders placed after 2pm, or on weekends and U.S. holidays, ship the next business day.
        </p>
      </ProseSection>
      <ProseSection id="carriers" index={2} title="Carriers and tracking">
        <p>
          Domestic orders ship by USPS Priority or UPS Ground. Faster options, where available, are shown at checkout. Every shipment is tracked, and we send the tracking details once your order leaves us.
        </p>
      </ProseSection>
      <ProseSection id="costs" index={3} title="Shipping costs">
        <p>
          U.S. orders of <strong>{threshold} or more</strong> ship free. Orders under {threshold} pay a flat {formatPrice(flatShippingCents)} for standard shipping. Your total is always shown before you place the order.
        </p>
      </ProseSection>
      <ProseSection id="packaging" index={4} title="Packaging">
        <p>Vials are sealed and packed in plain, unmarked outer packaging. The lot-specific Certificate of Analysis is included in the box.</p>
      </ProseSection>
      <ProseSection id="international" index={5} title="International orders">
        <p>
          We ship to most countries where receiving research chemicals is legally permitted. You are responsible for checking local rules before ordering. Customs duties, taxes and delays are the recipient&apos;s responsibility, and we can&apos;t refund orders held or destroyed by customs.
        </p>
      </ProseSection>
      <ProseSection id="damaged" index={6} title="Damaged or defective items">
        <p>
          If an order arrives damaged, or a product is defective or misses its specification, contact us within <strong>7 days of delivery</strong> with your order number and a photo of the item and packaging. We&apos;ll reship or refund it at no cost to you.
        </p>
      </ProseSection>
      <ProseSection id="returns" index={7} title="Returns">
        <p>
          Because these are research materials, we can&apos;t accept returns of opened products. If you have a problem with an order, message us first and we&apos;ll work it out.
        </p>
      </ProseSection>
      <ProseSection id="address" index={8} title="Address problems">
        <p>
          Please check your shipping address before you order. If a parcel is returned because the address was wrong or incomplete, we&apos;ll reship it once the shipping cost is covered. Contact us on <a href={site.contact.whatsappHref}>WhatsApp</a> as soon as you spot a mistake and we&apos;ll fix it if the order hasn&apos;t shipped.
        </p>
      </ProseSection>
    </PolicyLayout>
  );
}
