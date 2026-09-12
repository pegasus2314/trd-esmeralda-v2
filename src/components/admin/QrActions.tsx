"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendQrAction, regenerateQrAction } from "@/lib/actions/accreditation-actions";

export function QrActions({ debaterId, teamId, hasEmail }: { debaterId: string; teamId: string; hasEmail: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!hasEmail) {
    return <span className="text-[10px] text-muted-2">Sin correo</span>;
  }

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await resendQrAction(debaterId, teamId);
            if (!result.ok) alert("No se pudo reenviar el correo: " + result.error);
            else alert("Correo reenviado con el mismo QR.");
            router.refresh();
          });
        }}
        className="rounded-lg border border-line-strong px-2.5 py-1.5 text-[10px] font-black hover:bg-cyan/10 disabled:opacity-50"
        title="Reenvía el correo con el mismo QR, sin invalidarlo"
      >
        Reenviar QR
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Esto invalida el QR anterior de este participante (dejará de funcionar) y envía uno nuevo por correo. ¿Continuar?")) return;
          startTransition(async () => {
            const result = await regenerateQrAction(debaterId, teamId);
            if (!result.ok) alert("No se pudo regenerar el QR: " + result.error);
            else alert("QR regenerado y reenviado. El anterior ya no es válido.");
            router.refresh();
          });
        }}
        className="rounded-lg border border-warning/35 px-2.5 py-1.5 text-[10px] font-black text-warning hover:bg-warning-bg disabled:opacity-50"
        title="Invalida el QR actual y genera uno nuevo"
      >
        Regenerar
      </button>
    </div>
  );
}
