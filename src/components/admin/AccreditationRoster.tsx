"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Badge, inputClass, EmptyState } from "@/components/ui/primitives";
import type { AccreditationRosterRow } from "@/lib/dal/accreditation";

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  accredited: "success",
  rejected: "danger",
  cancelled: "danger",
  no_show: "danger",
};

const ROLE_LABEL: Record<string, string> = {
  captain: "Capitán",
  debater: "Debatiente",
  alternate: "Suplente",
};

export function AccreditationRoster({
  debaters,
  statusLabel,
}: {
  debaters: AccreditationRosterRow[];
  statusLabel: Record<string, string>;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return debaters;
    return debaters.filter(
      (d) => d.fullName.toLowerCase().includes(q) || d.teamName.toLowerCase().includes(q)
    );
  }, [debaters, query]);

  const byTeam = useMemo(() => {
    const map = new Map<string, AccreditationRosterRow[]>();
    for (const d of filtered) {
      const list = map.get(d.teamName) ?? [];
      list.push(d);
      map.set(d.teamName, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div>
      <input
        className={`${inputClass} mb-5 max-w-sm`}
        placeholder="Buscar por nombre o equipo…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Buscar participante"
      />

      {byTeam.length === 0 ? (
        <EmptyState icon="🔍" title="Sin resultados" description="No hay participantes que coincidan con la búsqueda." />
      ) : (
        <div className="grid gap-4">
          {byTeam.map(([teamName, members]) => (
            <Card key={teamName} className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <strong className="text-sm">{teamName}</strong>
                <span className="text-xs text-muted">{members.length} integrantes</span>
              </div>
              <div className="grid gap-2">
                {members.map((d) => (
                  <Link
                    key={d.id}
                    href={`/admin/acreditar/${d.token}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-black/10 p-3 transition hover:border-cyan"
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm">{d.fullName}</strong>
                      <span className="text-xs text-muted">{ROLE_LABEL[d.role] ?? d.role}</span>
                    </div>
                    <Badge tone={STATUS_TONE[d.accreditationStatus]}>
                      {statusLabel[d.accreditationStatus] ?? d.accreditationStatus}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
