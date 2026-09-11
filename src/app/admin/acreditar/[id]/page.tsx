import { getCurrentStaff, ACCREDITATION_ROLES } from "@/lib/dal/auth";
import { getDebaterForAccreditation } from "@/lib/dal/accreditation";
import { Card, Badge } from "@/components/ui/primitives";
import { VerifyButton } from "@/components/admin/VerifyButton";

const STATUS_TONE = { pending: "warning", accredited: "success", rejected: "danger" } as const;
const STATUS_LABEL = { pending: "PENDIENTE", accredited: "ACREDITADO", rejected: "RECHAZADO" } as const;

export default async function AcreditarPage({ params }: PageProps<"/admin/acreditar/[id]">) {
  const { id } = await params;
  const staff = await getCurrentStaff();

  if (!staff) {
    return (
      <Card className="mx-auto max-w-lg p-7 text-center">
        <h1 className="text-xl font-bold">Sesión requerida</h1>
        <p className="mt-2 text-sm text-muted">
          Este QR abre una ficha protegida. Inicia sesión con una cuenta de acreditación,
          coordinación o administración para continuar.
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

  const debater = await getDebaterForAccreditation(id);
  if (!debater) {
    return (
      <Card className="mx-auto max-w-lg p-7 text-center">
        <h1 className="text-xl font-bold">QR no válido</h1>
        <p className="mt-2 text-sm text-muted">No se encontró este participante.</p>
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
          ["Correo", debater.email ?? "—"],
          ["Teléfono", debater.phone ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-black/15 p-3">
            <span className="block text-[10px] uppercase text-muted-2">{label}</span>
            <strong className="text-[13.5px]">{value}</strong>
          </div>
        ))}
      </div>

      {debater.accreditationStatus === "accredited" ? (
        <div className="mt-5 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <strong className="text-cyan">✓ Participante acreditado</strong>
          <p className="mt-1 text-xs text-muted">La verificación ya está registrada en el sistema.</p>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
          <div>
            <strong className="text-sm">¿Los datos son correctos?</strong>
            <p className="mt-0.5 text-xs text-muted">Confirma la identidad antes de acreditar.</p>
          </div>
          <VerifyButton debaterId={debater.id} />
        </div>
      )}
    </Card>
  );
}
