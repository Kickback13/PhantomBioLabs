"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useActionState, useEffect, useState } from "react";
import { ArrowRight, CircleCheck, CreditCard, FlaskConical, Lock, MessageCircle, ShoppingBag } from "lucide-react";
import { placeOrder, type CheckoutState } from "@/app/checkout/actions";
import { useCart } from "@/components/cart/cart-context";
import { CheckField, Field, FormError, inputClass } from "@/components/forms/field";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { CheckoutStepper } from "./checkout-stepper";

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "Netherlands", "Other"];

export function CheckoutForm() {
  const { lines, ready, subtotalCents, settings, clear } = useCart();
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, { status: "idle" });
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  // Prefill the email for signed-in customers.
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) return;
        setSignedIn(true);
        setEmail((current) => current || data.user!.email || "");
      });
  }, []);

  useEffect(() => {
    if (state.status !== "placed") return;
    clear();
    if (state.redirectUrl) window.location.assign(state.redirectUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state, clear]);

  if (state.status === "placed") {
    return (
      <div className="mx-auto max-w-2xl">
        <CheckoutStepper active={3} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 rounded-3xl border border-violet-400/30 bg-ink-900 p-6 text-center shadow-[0_40px_120px_-30px_rgba(139,61,255,0.45)] sm:p-10"
        >
          <CircleCheck className="mx-auto size-10 text-violet-300" />
          <p className="eyebrow mt-5">Order received</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em]">Order #{state.orderNumber}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Total {formatPrice(state.totalCents)}. Your order is reserved with status <span className="text-foreground">Pending payment</span>. Our team will
            contact you at <span className="text-foreground">{state.email}</span> with payment instructions, and your order ships once payment clears.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <a href={site.contact.whatsappHref}>
                <MessageCircle /> Message us on WhatsApp
              </a>
            </Button>
            <Button asChild>
              <Link href={signedIn ? "/account/orders" : "/shop"}>
                {signedIn ? "View your orders" : "Continue shopping"} <ArrowRight />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!ready) return <div className="h-96 animate-pulse rounded-3xl bg-surface" />;

  if (!lines.length) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-line-strong py-20 text-center">
        <ShoppingBag className="size-8 text-violet-300" />
        <p className="mt-4 text-lg font-medium">Your cart is empty</p>
        <Button asChild className="mt-6">
          <Link href="/shop">
            Shop the catalog <ArrowRight />
          </Link>
        </Button>
      </div>
    );
  }

  const fields = state.status === "error" ? state.fields ?? {} : {};
  const shipping = subtotalCents >= settings.freeShippingThresholdCents ? 0 : settings.flatShippingCents;

  return (
    <div>
      <CheckoutStepper active={1} />
      <form action={action} className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <input type="hidden" name="items" value={JSON.stringify(lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })))} />
        <div className="space-y-8">
          {state.status === "error" && <FormError>{state.message}</FormError>}

          <Section title="Contact" step="01">
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fields.email}
              hint={signedIn ? undefined : <>Have an account? <Link href="/login?next=/checkout" className="text-violet-300 hover:underline">Sign in</Link> to track this order.</>}
            />
          </Section>

          <Section title="Shipping address" step="02">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" autoComplete="name" required error={fields.name} className="sm:col-span-2" />
              <Field label="Street address" name="line1" autoComplete="address-line1" required error={fields.line1} className="sm:col-span-2" />
              <Field label="Apartment, suite, unit" name="line2" autoComplete="address-line2" className="sm:col-span-2" />
              <Field label="City" name="city" autoComplete="address-level2" required error={fields.city} />
              <Field label="State / region" name="region" autoComplete="address-level1" required error={fields.region} />
              <Field label="ZIP / postal code" name="postal_code" autoComplete="postal-code" required error={fields.postal_code} />
              <div className="space-y-1.5">
                <label htmlFor="country" className="block text-[13px] font-medium text-ink-200">
                  Country
                </label>
                <select id="country" name="country" autoComplete="country-name" defaultValue="United States" className={`${inputClass} [&>option]:bg-ink-900`}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" hint="For delivery questions only." className="sm:col-span-2" />
            </div>
          </Section>

          <Section title="Shipping method" step="03">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-violet-400/50 bg-violet-500/[0.06] p-4">
              <span className="flex items-center gap-3">
                <input type="radio" name="shipping_method" value="standard" defaultChecked className="accent-[var(--violet-500)]" />
                <span>
                  <span className="block text-sm font-medium">Standard</span>
                  <span className="block text-xs text-muted">USPS Priority or UPS Ground · ships same day before 2pm ET</span>
                </span>
              </span>
              <span className="text-sm tabular-nums">{shipping ? formatPrice(shipping) : "Free"}</span>
            </label>
            <div className="mt-4 space-y-1.5">
              <label htmlFor="note" className="block text-[13px] font-medium text-ink-200">
                Order note <span className="font-normal text-subtle">(optional)</span>
              </label>
              <textarea id="note" name="note" rows={3} maxLength={1000} className={`${inputClass} h-auto py-3`} placeholder="Institution, PO number or delivery notes" />
            </div>
          </Section>

          <Section title="Confirm" step="04">
            <div className="space-y-3">
              <CheckField name="research_use" required>
                I confirm these products are for <span className="font-medium text-foreground">laboratory research use only</span> and will not be used for human or
                animal consumption.
                {fields.research_use && <span className="mt-1 block text-xs text-danger">{fields.research_use}</span>}
              </CheckField>
              <CheckField name="age" required>
                I confirm I am <span className="font-medium text-foreground">21 years of age or older</span>, a qualified researcher, and that I accept the{" "}
                <Link href="/terms" className="text-violet-300 hover:underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link href="/research-use" className="text-violet-300 hover:underline">
                  research use policy
                </Link>
                .{fields.age && <span className="mt-1 block text-xs text-danger">{fields.age}</span>}
              </CheckField>
            </div>
          </Section>

          <Section title="Payment" step="05">
            <div className="flex gap-3 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed">
              <CreditCard className="mt-0.5 size-4 shrink-0 text-violet-300" />
              <p className="text-ink-200">
                Online payment is being connected. Place your order now and it&apos;s reserved as <span className="text-foreground">Pending payment</span>; our team will
                contact you with payment instructions before it ships.
              </p>
            </div>
          </Section>
        </div>

        <aside className="h-fit space-y-5 rounded-3xl border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Order summary</p>
          <ul className="space-y-4">
            {lines.map((l) => (
              <li key={l.variantId} className="flex items-center gap-3">
                <div className="relative w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-ink-850">
                  <ProductImage slug={l.slug} name={l.name} size={l.label} sizes="56px" showTag={false} />
                  <span className="absolute -top-0 -right-0 grid size-5 place-items-center rounded-bl-lg bg-violet-500 font-mono text-[10px] text-white">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="font-mono text-[11px] text-muted">{l.label}</p>
                </div>
                <p className="text-sm tabular-nums">{formatPrice(l.priceCents * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd className="tabular-nums">{shipping ? formatPrice(shipping) : "Free"}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(subtotalCents + shipping)}</dd>
            </div>
          </dl>
          <p className="text-xs text-subtle">Prices and stock are checked again when you place the order.</p>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            <Lock /> {pending ? "Placing order…" : "Place order"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-subtle">
            <FlaskConical className="size-3" /> {site.compliance.short}
          </p>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold tracking-tight">
        <span className="font-mono text-[11px] text-violet-400">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
