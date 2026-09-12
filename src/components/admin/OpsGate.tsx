import { redirect } from "next/navigation";
import { getCurrentStaff, OPS_ROLES, type StaffUser } from "@/lib/dal/auth";
import { Card } from "@/components/ui/primitives";

export type OpsGateResult =
  | { ok: true; staff: StaffUser }
  | { ok: false; element: React.ReactElement };

/** Chequeo de acceso repetido en cada vista de /admin/operaciones/*. Redirige a /acceso sin sesión, o devuelve un elemento "Sin permiso" si el rol no alcanza. */
export async function requireOpsAccess(): Promise<OpsGateResult> {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/acceso");
  if (!OPS_ROLES.includes(staff.role)) {
    return {
      ok: false,
      element: (
        <Card className="mx-auto max-w-lg p-7 text-center">
          <h1 className="text-xl font-bold text-danger">Sin permiso</h1>
          <p className="mt-2 text-sm text-muted">
            Tu rol (&quot;{staff.role}&quot;) no tiene acceso al Centro de Operaciones.
          </p>
        </Card>
      ),
    };
  }
  return { ok: true, staff };
}
