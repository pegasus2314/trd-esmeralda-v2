"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveTeamAction, rejectTeamAction, deleteTeamAction } from "@/lib/actions/admin-actions";
import { Button } from "@/components/ui/Button";

export function TeamActions({
  teamId,
  status,
  compact = false,
}: {
  teamId: string;
  status: "pending" | "approved" | "rejected" | "waitlist";
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Error desconocido.");
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "approved" && (
        <Button size="sm" variant="primary" disabled={pending} onClick={() => run(() => approveTeamAction(teamId))}>
          Aprobar
        </Button>
      )}
      {status !== "rejected" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            if (confirm("¿Confirmas que quieres rechazar este equipo?")) run(() => rejectTeamAction(teamId));
          }}
        >
          Rechazar
        </Button>
      )}
      {!compact && (
        <Button
          size="sm"
          variant="danger"
          disabled={pending}
          onClick={() => {
            if (confirm("Eliminar este equipo y todos sus participantes, coach y registro. Esta acción no se puede deshacer. ¿Continuar?")) {
              startTransition(async () => {
                const result = await deleteTeamAction(teamId);
                if (!result.ok) setError(result.error ?? "Error desconocido.");
                else router.push("/admin/equipos");
              });
            }
          }}
        >
          Eliminar equipo
        </Button>
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
