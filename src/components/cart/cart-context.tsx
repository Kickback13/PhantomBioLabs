"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

export const MAX_LINE_QUANTITY = 20;
const STORAGE_KEY = "pbl-cart-v1";

/** A cart line. Prices are a snapshot for display; checkout re-reads them from the database. */
export type CartLine = {
  variantId: string;
  slug: string;
  name: string;
  label: string;
  priceCents: number;
  compareAtCents: number | null;
  quantity: number;
};

type CartSettings = { freeShippingThresholdCents: number; flatShippingCents: number };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  settings: CartSettings;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((l) => l && typeof l.variantId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

// The cart lives in localStorage and is read through useSyncExternalStore, so every tab and
// component sees the same lines and server rendering always starts from an empty cart.
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let snapshot: CartLine[] | null = null;

function getSnapshot() {
  if (snapshot === null) snapshot = readStored();
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    snapshot = readStored();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(update: (lines: CartLine[]) => CartLine[]) {
  snapshot = update(getSnapshot());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage full or blocked: the cart still works for this visit.
  }
  for (const listener of listeners) listener();
}

const noopSubscribe = () => () => {};

export function CartProvider({ settings, children }: { settings: CartSettings; children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    write((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId);
      if (existing) {
        return prev.map((l) =>
          l.variantId === line.variantId ? { ...l, ...line, quantity: Math.min(MAX_LINE_QUANTITY, l.quantity + quantity) } : l,
        );
      }
      return [...prev, { ...line, quantity: Math.min(MAX_LINE_QUANTITY, quantity) }];
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    write((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(MAX_LINE_QUANTITY, quantity) } : l)),
    );
  }, []);

  const remove = useCallback((variantId: string) => write((prev) => prev.filter((l) => l.variantId !== variantId)), []);
  const clear = useCallback(() => write(() => []), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.priceCents * l.quantity, 0),
      settings,
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, ready, settings, open, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
