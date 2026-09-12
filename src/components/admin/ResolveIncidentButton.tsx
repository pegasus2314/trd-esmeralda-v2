"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveIncidentAction } from "@/lib/actions/operations-actions";
import { Button } from "@/components/ui/Button";

export function ResolveIncidentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      variant="primary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await resolveIncidentAction(id);
          if (!result.ok) alert(result.error);
          router.refresh();
        })
      }
    >
      {pending ? "…" : "✓ Resolver"}
    </Button>
  );
}
