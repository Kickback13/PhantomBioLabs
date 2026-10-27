"use client";

import { useActionState, useState } from "react";
import { updateOrder } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/admin";
import { Field, Input, Select } from "./fields";
import { initialActionState, useActionToast } from "./use-action-toast";

export function OrderForm({
  id,
  status,
  statuses,
  paymentProvider,
  paymentReference,
}: {
  id: string;
  status: OrderStatus;
  statuses: { value: OrderStatus; label: string }[];
  paymentProvider: string | null;
  paymentReference: string | null;
}) {
  const [state, action, pending] = useActionState(updateOrder, initialActionState);
  const [value, setValue] = useState<OrderStatus>(status);
  const [provider, setProvider] = useState(paymentProvider ?? "");
  const [reference, setReference] = useState(paymentReference ?? "");
  useActionToast(state);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Status" htmlFor="order-status">
        <Select id="order-status" name="status" value={value} onChange={(e) => setValue(e.target.value as OrderStatus)}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Payment method" htmlFor="order-provider" hint="Fill in when payment arrives, e.g. Zelle or wire.">
        <Input id="order-provider" name="payment_provider" maxLength={60} value={provider} onChange={(e) => setProvider(e.target.value)} />
      </Field>
      <Field label="Payment reference" htmlFor="order-ref" hint="Transaction ID or note, for your records.">
        <Input id="order-ref" name="payment_reference" maxLength={200} value={reference} onChange={(e) => setReference(e.target.value)} className="font-mono" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Update order"}
      </Button>
    </form>
  );
}
