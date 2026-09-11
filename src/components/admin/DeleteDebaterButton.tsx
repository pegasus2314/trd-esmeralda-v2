"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDebaterAction } from "@/lib/actions/admin-actions";

export function DeleteDebaterButton({ debaterId, teamId }: { debaterId: string; teamId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Eliminar este participante? Esta acción no se puede deshacer.")) return;
        startTransition(async () => {
          const result = await deleteDebaterAction(debaterId, teamId);
          if (!result.ok) alert(result.error);
          else router.refresh();
        });
      }}
      className="rounded-lg border border-danger/35 px-2.5 py-1.5 text-[10px] font-black text-[#ff9999] hover:bg-danger-bg disabled:opacity-50"
    >
      Eliminar
    </button>
  );
}
