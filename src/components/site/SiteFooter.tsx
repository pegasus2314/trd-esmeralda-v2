import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/inscripcion", label: "Inscripción" },
  { href: "/participantes", label: "Participantes" },
  { href: "/torneo", label: "El torneo" },
  { href: "/logistica", label: "Logística" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-5 border-t border-line bg-[#04111b] px-[4vw] py-5 text-[11px] text-[#7f97a7]">
      <div className="flex items-center gap-2.5">
        <img src="/logo-regional17.svg" alt="Regional 17" className="h-8.5 w-8.5" />
        <div>
          <b className="block text-xs text-[#e7f2f7]">TRD La Regional Esmeralda</b>
          <small className="block text-[9px]">Torneo Regional de Debate · Regional 17</small>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-[#91a9b8] hover:text-cyan">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
