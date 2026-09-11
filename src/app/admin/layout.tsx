import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentStaff, type StaffRole } from "@/lib/dal/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/Button";

const ROLE_LABELS: Record<StaffRole, string> = {
  admin_maestro: "Administrador maestro",
  admin: "Administrador",
  coordinador: "Coordinador",
  acreditacion: "Acreditación",
  logistica: "Logística",
  evaluador: "Evaluador",
};

const NAV_ITEMS: { href: string; label: string; roles: StaffRole[] }[] = [
  { href: "/admin", label: "Resumen", roles: ["admin_maestro", "admin", "coordinador"] },
  { href: "/admin/equipos", label: "Equipos", roles: ["admin_maestro", "admin", "coordinador"] },
  { href: "/admin/rondas", label: "Rondas", roles: ["admin_maestro", "admin", "coordinador"] },
  { href: "/admin/enfrentamientos", label: "Enfrentamientos", roles: ["admin_maestro", "admin", "coordinador"] },
  { href: "/admin/anuncios", label: "Anuncios", roles: ["admin_maestro", "admin", "coordinador"] },
  { href: "/admin/staff", label: "Personal", roles: ["admin_maestro"] },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/acceso");

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(staff.role));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-navy-900 px-[4vw] py-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-regional17.svg" alt="Regional 17" className="h-10 w-10" />
          <span>
            <b className="block text-sm">TRD La Regional Esmeralda</b>
            <small className="block text-[11px] text-muted">Centro de gestión</small>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            Sesión activa · <b className="text-celeste">{ROLE_LABELS[staff.role]}</b>
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="danger" size="sm">
              🚪 Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      {visibleItems.length > 1 && (
        <nav className="flex flex-wrap gap-2 border-b border-line bg-navy-900 px-[4vw] py-3">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-[#a9bfcc] hover:border-cyan hover:bg-cyan/10 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <main className="mx-auto w-[94vw] max-w-6xl flex-1 py-8">{children}</main>
    </div>
  );
}
