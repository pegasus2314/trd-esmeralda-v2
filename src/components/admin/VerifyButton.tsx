"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyDebaterAction } from "@/lib/actions/accreditation-actions";
import { Button } from "@/components/ui/Button";

export function VerifyButton({ debaterId }: { debaterId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="primary"
      disabled={pending}
      onClick={() => {
        if (!confirm("¿Confirmas que este participante fue verificado y debe pasar a Acreditado?")) return;
        startTransition(async () => {
          const result = await verifyDebaterAction(debaterId);
          if (!result.ok) alert(result.error);
          router.refresh();
        });
      }}
    >
      {pending ? "Registrando…" : "✓ Verificar y acreditar"}
    </Button>
  );
}
