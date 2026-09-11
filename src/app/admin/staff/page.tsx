import { listStaff } from "@/lib/dal/admin";
import { inviteStaffAction, removeStaffAction } from "@/lib/actions/admin-actions";
import { Card, Field, inputClass, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";

const ROLE_OPTIONS = [
  { value: "admin_maestro", label: "Administrador maestro" },
  { value: "admin", label: "Administrador" },
  { value: "coordinador", label: "Coordinador" },
  { value: "acreditacion", label: "Acreditación" },
  { value: "logistica", label: "Logística" },
  { value: "evaluador", label: "Evaluador" },
];

export default async function StaffPage() {
  const staff = await listStaff();

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl">Personal</h1>

      <Card className="mb-5 p-5">
        <form
          action={async (formData) => {
            "use server";
            await inviteStaffAction(formData);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-4"
        >
          <Field label="Correo">
            <input className={inputClass} type="email" name="email" required />
          </Field>
          <Field label="Nombre">
            <input className={inputClass} name="fullName" />
          </Field>
          <Field label="Rol">
            <select className={inputClass} name="role" required defaultValue="coordinador">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="primary" className="self-end">
            Invitar
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted">
          Se crea la cuenta y se le envía un correo para que fije su propia contraseña.
        </p>
      </Card>

      {staff.length === 0 ? (
        <EmptyState title="No hay personal registrado." />
      ) : (
        <div className="overflow-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[10.5px] uppercase text-muted">
                <th className="p-3">Correo</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Rol</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.userId} className="border-t border-line">
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 text-muted">{s.fullName ?? "—"}</td>
                  <td className="p-3 text-muted">{ROLE_OPTIONS.find((r) => r.value === s.role)?.label ?? s.role}</td>
                  <td className="p-3">
                    <DeleteRowButton id={s.userId} action={removeStaffAction} confirmMessage="¿Quitar el acceso de esta persona?" />
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
