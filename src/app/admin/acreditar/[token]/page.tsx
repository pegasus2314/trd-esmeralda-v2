import { getCurrentStaff, ACCREDITATION_ROLES } from "@/lib/dal/auth";
import { getDebaterForAccreditation } from "@/lib/dal/accreditation";
import { Card, Badge } from "@/components/ui/primitives";
import { VerifyButton } from "@/components/admin/VerifyButton";

const STATUS_TONE = {
  pending: "warning",
  accredited: "success",
  rejected: "danger",
  cancelled: "danger",
  no_show: "danger",
} as const;
const STATUS_LABEL = {
  pending: "PENDIENTE",
  accredited: "PRESENTE",
  rejected: "RECHAZADO",
  cancelled: "CANCELADO",
  no_show: "NO ASISTIÓ",
} as const;

export default async function AcreditarPage({ params }: PageProps<"/admin/acreditar/[token]">) {
  const { token } = await params;
  const staff = await getCurrentStaff();

  if (!staff) {
    return (
      <Card className="mx-auto max-w-lg p-7 text-center">
        <h1 className="text-xl font-bold">Sesión requerida</h1>
        <p className="mt-2 text-sm text-muted">
          Este QR abre una ficha protegida. Inicia sesión con una cuenta de acreditación,
          logística, coordinación o administración para continuar.
        </p>
        <a href="/acceso" className="mt-4 inline-block rounded-lg border border-cyan bg-cyan px-5 py-2.5 font-bold text-cyan-ink">
          Ir a iniciar sesión
        </a>
      </Card>
    );
  }

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

  const debater = await getDebaterForAccreditation(token);
  if (!debater) {
    return (
      <Card className="mx-auto max-w-lg p-7 text-center">
        <h1 className="text-xl font-bold">QR no válido</h1>
        <p className="mt-2 text-sm text-muted">
          No se encontró este participante. El QR puede haber sido regenerado — pide que te
          reenvíen el código actualizado.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="block text-[11px] font-extrabold uppercase tracking-wide text-cyan">
            Ficha de acreditación
          </span>
          <h1 className="mt-1 font-display text-3xl">{debater.fullName}</h1>
          <p className="mt-1 text-xs text-muted">
            Código: <strong>{debater.id.slice(0, 8).toUpperCase()}</strong>
          </p>
        </div>
        <Badge tone={STATUS_TONE[debater.accreditationStatus]}>{STATUS_LABEL[debater.accreditationStatus]}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[
          ["Rol", debater.role === "captain" ? "Capitán" : debater.role === "alternate" ? "Suplente" : "Debatiente"],
          ["Equipo", debater.teamName],
          ["Centro educativo", debater.schoolName],
          ["Distrito", debater.district ?? "—"],
          ["Grado", debater.grade ?? "—"],
          ["Cédula", debater.idNumber ?? "—"],
          ["Correo", debater.email ?? "—"],
          ["Teléfono", debater.phone ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-black/15 p-3">
            <span className="block text-[10px] uppercase text-muted-2">{label}</span>
            <strong className="text-[13.5px]">{value}</strong>
          </div>
        ))}
      </div>

      {(debater.allergies || debater.medications) && (
        <div className="mt-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <strong className="block text-xs font-extrabold uppercase tracking-wide text-warning">
            ⚠ Información médica
          </strong>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <span className="block text-[10px] uppercase text-muted-2">Alergias</span>
              <strong className="text-[13.5px]">{debater.allergies || "Ninguna reportada"}</strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-muted-2">Medicamentos</span>
              <strong className="text-[13.5px]">{debater.medications || "Ninguno reportado"}</strong>
            </div>
          </div>
        </div>
      )}

      {debater.accreditationStatus === "accredited" ? (
        <div className="mt-5 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <strong className="text-cyan">✓ Participante presente</strong>
          <p className="mt-1 text-xs text-muted">
            {debater.accreditationVerifiedAt &&
              `Registrado el ${new Date(debater.accreditationVerifiedAt).toLocaleString("es-DO")}.`}
          </p>
        </div>
      ) : debater.accreditationStatus === "pending" ? (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <div>
            <strong className="text-sm">¿Los datos son correctos?</strong>
            <p className="mt-0.5 text-xs text-muted">Confirma la identidad antes de acreditar.</p>
          </div>
          <VerifyButton token={debater.token} />
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-danger/25 bg-danger-bg p-4">
          <strong className="text-[#ff9999]">
            Este participante no puede acreditarse (estado: {STATUS_LABEL[debater.accreditationStatus]}).
          </strong>
        </div>
      )}
    </Card>
  );
}
