import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentStaff, ADMIN_PANEL_ROLES, ACCREDITATION_ROLES } from "@/lib/dal/auth";
import { getOverview } from "@/lib/dal/admin";
import { getCurrentEvent } from "@/lib/dal/public";
import { Card } from "@/components/ui/primitives";
import { EventStatusControl } from "@/components/admin/EventStatusControl";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <span className="block text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <strong className="mt-1 block font-display text-3xl text-cyan">{value}</strong>
    </Card>
  );
}

const ROLE_HELP: Record<string, { title: string; body: string }> = {
  acreditacion: {
    title: "Acreditación",
    body: "Tu función es escanear el código QR de cada participante y confirmar su acreditación. Al escanear un QR válido, se te llevará directo a su ficha.",
  },
  logistica: {
    title: "Logística",
    body: "Tienes acceso de consulta a los equipos y participantes registrados, y puedes escanear el QR de un participante para consultar su ficha y apoyar la acreditación si hace falta.",
  },
  evaluador: {
    title: "Evaluador",
    body: "Tu función es registrar las evaluaciones de los enfrentamientos que te sean asignados.",
  },
};

export default async function AdminOverviewPage() {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/acceso");

  if (!ADMIN_PANEL_ROLES.includes(staff.role)) {
    const help = ROLE_HELP[staff.role];
    return (
      <div>
        <h1 className="font-display text-3xl">Bienvenido/a</h1>
        <Card className="mt-5 p-6">
          <h2 className="text-lg font-bold text-celeste">{help?.title ?? staff.role}</h2>
          <p className="mt-2 text-sm text-muted">{help?.body ?? "Consulta con administración sobre tus permisos."}</p>
          {ACCREDITATION_ROLES.includes(staff.role) && (
            <Link
              href="/admin/escanear"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan bg-cyan px-5 py-3 font-bold text-cyan-ink"
            >
              📷 Escanear QR de participante
            </Link>
          )}
        </Card>
      </div>
    );
  }

  const [{ teams, debaterCount }, event] = await Promise.all([getOverview(), getCurrentEvent()]);
  const pending = teams.filter((t) => t.status === "pending").length;
  const approved = teams.filter((t) => t.status === "approved").length;
  const rejected = teams.filter((t) => t.status === "rejected").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Resumen</h1>
        {event && (staff.role === "admin_maestro" || staff.role === "admin") && (
          <EventStatusControl current={event.status} />
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <StatCard label="Equipos" value={teams.length} />
        <StatCard label="Pendientes" value={pending} />
        <StatCard label="Aprobados" value={approved} />
        <StatCard label="Rechazados" value={rejected} />
        <StatCard label="Debatientes" value={debaterCount} />
      </div>
    </div>
  );
}
