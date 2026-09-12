"use client";

import { useRef, useState } from "react";
import type { OpsVenue, OpsPoint } from "@/lib/dal/operations";

const TYPE_CLASS: Record<OpsPoint["type"], string> = {
  entry: "fill-cyan/15 stroke-cyan",
  corridor: "fill-white/[0.06] stroke-line-strong",
  room: "fill-celeste/15 stroke-celeste",
  service: "fill-danger/15 stroke-danger",
};

const CANVAS_W = 420;
const CANVAS_H = 300;

export function OpsFloorplan({ venues }: { venues: OpsVenue[] }) {
  const [activeId, setActiveId] = useState(venues[0]?.id ?? "");
  const [selected, setSelected] = useState<OpsPoint | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const venue = venues.find((v) => v.id === activeId) ?? venues[0];

  function openPoint(p: OpsPoint) {
    setSelected(p);
    dialogRef.current?.showModal();
  }

  if (!venue) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {venues.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveId(v.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              v.id === venue.id ? "border-cyan bg-cyan text-cyan-ink" : "border-line text-muted hover:border-cyan"
            }`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-navy-900 p-4">
        <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wide text-muted">
          Plano ilustrativo · {venue.name.toUpperCase()}
        </div>
        {venue.points.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Esta sede no tiene puntos definidos todavía.</p>
        ) : (
          <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="block w-full">
            {venue.points.map((p) => {
              const cx = p.x + p.w / 2;
              const cy = p.y + p.h / 2;
              return (
                <g key={p.id} className="cursor-pointer" onClick={() => openPoint(p)}>
                  <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={8} strokeWidth={1.5} className={TYPE_CLASS[p.type]} />
                  <text x={cx} y={cy} textAnchor="middle" className="fill-ink text-[13px] font-bold font-mono">
                    {p.code}
                  </text>
                  <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted text-[8.5px]">
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted">
          <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-sm border border-cyan bg-cyan/30" />Entrada / acceso</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-sm border border-line-strong bg-white/20" />Corredor</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-sm border border-celeste bg-celeste/30" />Salón</span>
          <span className="flex items-center gap-1.5"><i className="inline-block h-2.5 w-2.5 rounded-sm border border-danger bg-danger/30" />Servicio</span>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="w-[min(400px,92vw)] rounded-2xl border border-line-strong bg-navy-800 p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-3 top-2 text-2xl text-muted hover:text-ink"
            aria-label="Cerrar"
          >
            ×
          </button>
          <h2 className="pr-6 text-xl font-bold">
            {selected?.code} · {selected?.name}
          </h2>
          <div className="mt-3 grid gap-2">
            {selected?.assignments.length ? (
              selected.assignments.map((a) => (
                <div key={a.id} className="rounded-lg border border-line bg-black/15 p-3">
                  <strong className="block text-sm">{a.displayName}</strong>
                  {a.groupLabel && <span className="text-xs text-cyan">{a.groupLabel}</span>}
                  {a.note && <p className="mt-1 text-xs text-muted">{a.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">Sin personal asignado a este punto.</p>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}
