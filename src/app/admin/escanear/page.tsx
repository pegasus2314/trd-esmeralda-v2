import { redirect } from "next/navigation";
import { getCurrentStaff, ACCREDITATION_ROLES } from "@/lib/dal/auth";
import { Card } from "@/components/ui/primitives";
import { QrScannerView } from "@/components/admin/QrScannerView";

export default async function EscanearPage() {
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

  return (
    <div>
      <div className="mb-5 text-center">
        <span className="block text-[11px] font-extrabold uppercase tracking-wide text-cyan">
          Acreditación
        </span>
        <h1 className="mt-1 font-display text-3xl">Escanear QR</h1>
        <p className="mt-1 text-sm text-muted">
          Escanea el código QR del participante para abrir su ficha de acreditación.
        </p>
      </div>
      <QrScannerView />
    </div>
  );
}
