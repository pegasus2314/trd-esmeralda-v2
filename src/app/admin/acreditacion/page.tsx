import { redirect } from "next/navigation";
import { getCurrentStaff, ACCREDITATION_ROLES } from "@/lib/dal/auth";
import { listDebatersForAccreditation, ACCREDITATION_STATUS_LABEL } from "@/lib/dal/accreditation";
import { Card } from "@/components/ui/primitives";
import { AccreditationRoster } from "@/components/admin/AccreditationRoster";

export default async function AcreditacionPage() {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/acceso");

  if (!ACCREDITATION_ROLES.includes(staff.role)) {
    return (
      <Card className="mx-auto max-w-lg p-7 text-center">
        <h1 className="text-xl font-bold text-danger">Sin permiso</h1>
        <p className="mt-2 text-sm text-muted">
          Tu rol (&quot;{staff.role}&quot;) no tiene permisos de acreditación.
        </p>
      </Card>
    );
  }

  const debaters = await listDebatersForAccreditation();
  const total = debaters.length;
  const present = debaters.filter((d) => d.accreditationStatus === "accredited").length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-wide text-cyan">
            Acreditación
          </span>
          <h1 className="mt-1 font-display text-3xl">Equipos y participantes</h1>
          <p className="mt-1 text-sm text-muted">
            {present} de {total} participantes presentes.
          </p>
        </div>
        <a
          href="/admin/escanear"
          className="inline-flex items-center gap-2 rounded-xl border border-cyan bg-cyan px-5 py-3 font-bold text-cyan-ink"
        >
          📷 Escanear QR
        </a>
      </div>

      <AccreditationRoster debaters={debaters} statusLabel={ACCREDITATION_STATUS_LABEL} />
    </div>
  );
}
