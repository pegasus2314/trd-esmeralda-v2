import { notFound } from "next/navigation";
import { getTeamDetail } from "@/lib/dal/admin";
import { getOrigin } from "@/lib/origin";
import { generateAccreditationQr } from "@/lib/qr";
import { Badge, Card } from "@/components/ui/primitives";
import { TeamActions } from "@/components/admin/TeamActions";
import { QrButton } from "@/components/admin/QrDialog";
import { DeleteDebaterButton } from "@/components/admin/DeleteDebaterButton";
import { QrActions } from "@/components/admin/QrActions";

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
const ACCREDITATION_LABEL: Record<string, string> = {
  pending: "Pendiente",
  accredited: "Acreditado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  no_show: "No asistió",
};

export default async function TeamDetailPage({ params }: PageProps<"/admin/equipos/[id]">) {
  const { id } = await params;
  const team = await getTeamDetail(id);
  if (!team) notFound();

  const origin = await getOrigin();
  const debatersWithQr = await Promise.all(
    team.debaters.map(async (d) => ({ ...d, qr: await generateAccreditationQr(d.accreditationToken, origin) }))
  );

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-wide text-cyan">
            Ficha del equipo
          </span>
          <h1 className="mt-1 font-display text-3xl">{team.teamName}</h1>
          <p className="mt-1 text-sm text-muted">
            {team.schoolName}
            {team.district ? ` · ${team.district}` : ""}
          </p>
        </div>
        <TeamActions teamId={team.id} status={team.status} />
      </header>

      <Card className="mb-4 p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-sm font-bold">Información del equipo</span>
          <Badge tone={STATUS_TONE[team.status]}>{STATUS_LABEL[team.status]}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[
            ["Centro educativo", team.schoolName],
            ["Distrito", team.district],
            ["Responsable", team.contactName],
            ["Correo", team.contactEmail],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-black/15 p-3">
              <small className="block text-[10.5px] uppercase text-muted-2">{label}</small>
              <strong className="text-[13.5px]">{value || "—"}</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <span className="mb-3 block text-sm font-bold">Docente coach</span>
        {team.coach ? (
          <div className="rounded-lg bg-black/15 p-3">
            <strong className="block text-[13.5px]">{team.coach.fullName}</strong>
            <span className="text-xs text-muted">{team.coach.email}</span>
          </div>
        ) : (
          <p className="text-sm text-muted">No hay docente coach registrado.</p>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold">Integrantes</span>
          <span className="rounded-full bg-cyan/10 px-2.5 py-1 text-[10.5px] font-extrabold text-cyan">
            {team.debaters.length}
          </span>
        </div>
        {debatersWithQr.length === 0 ? (
          <p className="text-sm text-muted">No hay integrantes registrados.</p>
        ) : (
          <div className="grid gap-2">
            {debatersWithQr.map((d, i) => (
              <div key={d.id} className="grid grid-cols-[28px_1fr_auto_auto_auto] items-center gap-3 rounded-lg border border-line bg-black/10 p-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan/10 text-xs font-extrabold text-cyan">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-sm">{d.fullName}</strong>
                  <span className="text-xs text-muted">
                    {d.role === "captain" ? "Capitán" : d.role === "alternate" ? "Suplente" : "Debatiente"}
                    {" · "}
                    {ACCREDITATION_LABEL[d.accreditationStatus]}
                    {d.qrSentAt ? ` · QR enviado (${d.qrSentCount}x)` : " · QR no enviado"}
                  </span>
                </div>
                <QrButton name={d.fullName} qrDataUrl={d.qr} />
                <QrActions debaterId={d.id} teamId={team.id} hasEmail={!!d.email} />
                <DeleteDebaterButton debaterId={d.id} teamId={team.id} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
