import Link from "next/link";
import { listTeams } from "@/lib/dal/admin";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { TeamActions } from "@/components/admin/TeamActions";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  waitlist: "Lista de espera",
};
const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  waitlist: "default",
};

export default async function AdminEquiposPage() {
  const teams = await listTeams();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-3xl">Equipos</h1>
      </div>

      {teams.length === 0 ? (
        <EmptyState title="No hay equipos registrados." />
      ) : (
        <div className="overflow-auto rounded-2xl border border-line">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="text-left text-[10.5px] font-bold uppercase tracking-wide text-muted">
                <th className="p-3">Equipo</th>
                <th className="p-3">Centro</th>
                <th className="p-3">Distrito</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="border-t border-line text-sm hover:bg-cyan/[0.03]">
                  <td className="p-3">
                    <Link href={`/admin/equipos/${t.id}`} className="font-bold text-cyan hover:underline">
                      {t.teamName}
                    </Link>
                  </td>
                  <td className="p-3 text-muted">{t.schoolName}</td>
                  <td className="p-3 text-muted">{t.district ?? "—"}</td>
                  <td className="p-3">
                    <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                  </td>
                  <td className="p-3">
                    <TeamActions teamId={t.id} status={t.status} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
