"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/app/admin/actions";

/** Shows one toast per completed Server Action (keyed on state.at). */
export function useActionToast(state: ActionState) {
  const shown = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!state.at || state.at === shown.current) return;
    shown.current = state.at;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);
}

export const initialActionState: ActionState = { ok: false, message: "" };
