"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cycleBusStatusAction } from "@/lib/actions/operations-actions";
import type { OpsBus } from "@/lib/dal/operations";

const LABEL: Record<OpsBus["status"], string> = { base: "En base", route: "En ruta", arrived: "Llegó" };
const TONE: Record<OpsBus["status"], string> = {
  base: "bg-white/[0.08] text-muted",
  route: "bg-celeste/15 text-celeste",
  arrived: "bg-cyan/15 text-cyan",
};

export function BusStatusPill({ bus }: { bus: OpsBus }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await cycleBusStatusAction(bus.id);
          if (!result.ok) alert(result.error);
          router.refresh();
        })
      }
      className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide disabled:opacity-50 ${TONE[bus.status]}`}
    >
      {pending ? "…" : LABEL[bus.status]}
    </button>
  );
}
