"use client";

import { useActionState, useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { AdminSettings } from "@/lib/admin";
import { Card, Field, Input } from "./fields";
import { initialActionState, useActionToast } from "./use-action-toast";

const dollars = (cents: number) => (cents / 100).toFixed(2).replace(/\.00$/, "");

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const [state, action, pending] = useActionState(saveSettings, initialActionState);
  const [threshold, setThreshold] = useState(dollars(settings.freeShippingThresholdCents));
  const [flat, setFlat] = useState(dollars(settings.flatShippingCents));
  const [whatsapp, setWhatsapp] = useState(settings.supportWhatsapp);
  const [hours, setHours] = useState(settings.supportHours);
  useActionToast(state);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="space-y-6">
      <Card title="Shipping" description="Used in the announcement bar, the cart and checkout.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Free U.S. shipping over ($)" htmlFor="threshold" error={errors.free_shipping_threshold}>
            <Input id="threshold" name="free_shipping_threshold" inputMode="decimal" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </Field>
          <Field label="Shipping below that ($)" htmlFor="flat" error={errors.flat_shipping} hint="Flat rate per order. Use 0 for free shipping on every order.">
            <Input id="flat" name="flat_shipping" inputMode="decimal" value={flat} onChange={(e) => setFlat(e.target.value)} />
          </Field>
        </div>
      </Card>
      <Card title="Support contact" description="Saved for the contact details shown to customers.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="WhatsApp number" htmlFor="whatsapp" error={errors.support_whatsapp}>
            <Input id="whatsapp" name="support_whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+1 559 360 6568" />
          </Field>
          <Field label="Support hours" htmlFor="hours" error={errors.support_hours}>
            <Input id="hours" name="support_hours" maxLength={80} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon–Fri, 9am–6pm ET" />
          </Field>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
