import Link from "next/link";
import { getCurrentStaff } from "@/lib/dal/auth";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/inscripcion", label: "Inscripción" },
  { href: "/participantes", label: "Participantes" },
  { href: "/torneo", label: "El torneo" },
  { href: "/logistica", label: "Logística" },
];

export async function SiteHeader() {
  const staff = await getCurrentStaff();

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center gap-5 border-b border-line bg-navy-900/97 px-[4vw] py-2.5 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-3">
        <img src="/logo-regional17.svg" alt="Regional 17" className="h-12 w-12" />
        <span>
          <b className="block text-[17px] tracking-wide">REGIONAL 17</b>
          <strong className="block text-xs font-semibold text-celeste">
            TRD La Regional Esmeralda
          </strong>
        </span>
      </Link>
      <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-[#b9cad5] transition hover:text-cyan"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {staff ? (
          <Link
            href="/admin"
            className="inline-flex min-h-10.5 items-center gap-2 rounded-lg border border-cyan bg-cyan px-4 text-sm font-bold text-cyan-ink"
          >
            ⚙ Administración
          </Link>
        ) : (
          <Link
            href="/acceso"
            className="inline-flex min-h-10.5 items-center gap-2 rounded-lg border border-cyan bg-cyan px-4 text-sm font-bold text-cyan-ink"
          >
            ⚙ Administración
          </Link>
        )}
      </div>
    </header>
  );
}
