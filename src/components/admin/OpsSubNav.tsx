"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/operaciones", label: "Resumen" },
  { href: "/admin/operaciones/mapas", label: "Mapas" },
  { href: "/admin/operaciones/flota", label: "Flota" },
  { href: "/admin/operaciones/cronograma", label: "Cronograma" },
  { href: "/admin/operaciones/staff", label: "Staff" },
  { href: "/admin/operaciones/incidencias", label: "Incidencias" },
];

export function OpsSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-4">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-cyan bg-cyan text-cyan-ink"
                : "border-line text-muted hover:border-cyan hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
