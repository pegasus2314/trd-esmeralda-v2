"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setEventStatusAction } from "@/lib/actions/admin-actions";

const OPTIONS = [
  { value: "draft", label: "Borrador (oculto)" },
  { value: "open", label: "Abierto (acepta inscripciones)" },
  { value: "closed", label: "Cerrado" },
  { value: "archived", label: "Archivado" },
] as const;

export function EventStatusControl({ current }: { current: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <label className="text-xs font-bold text-muted">Estado del evento</label>
      <select
        defaultValue={current}
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value as (typeof OPTIONS)[number]["value"];
          startTransition(async () => {
            const result = await setEventStatusAction(status);
            if (!result.ok) alert(result.error);
            router.refresh();
          });
        }}
        className="rounded-lg border border-line bg-navy-900 px-3 py-2 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
