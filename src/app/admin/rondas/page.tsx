import { listRounds } from "@/lib/dal/admin";
import { createRoundAction, deleteRoundAction } from "@/lib/actions/admin-actions";
import { Card, Field, inputClass, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";

export default async function RondasPage() {
  const rounds = await listRounds();

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl">Rondas</h1>

      <Card className="mb-5 p-5">
        <form
          action={async (formData) => {
            "use server";
            await createRoundAction(formData);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-4"
        >
          <Field label="Número">
            <input className={inputClass} name="roundNumber" type="number" min={1} required />
          </Field>
          <Field label="Nombre" className="sm:col-span-2">
            <input className={inputClass} name="name" required placeholder="Ej. Ronda 1" />
          </Field>
          <Field label="Fecha y hora">
            <input className={inputClass} name="scheduledAt" type="datetime-local" />
          </Field>
          <Button type="submit" variant="primary" className="sm:col-span-4 sm:w-fit">
            Crear ronda
          </Button>
        </form>
      </Card>

      {rounds.length === 0 ? (
        <EmptyState title="No hay rondas creadas." />
      ) : (
        <div className="overflow-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[10.5px] uppercase text-muted">
                <th className="p-3">#</th>
                <th className="p-3">Ronda</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="p-3">{r.roundNumber}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3 text-muted">
                    {r.scheduledAt ? new Date(r.scheduledAt).toLocaleString("es-DO") : "—"}
                  </td>
                  <td className="p-3 text-muted">{r.status}</td>
                  <td className="p-3">
                    <DeleteRowButton id={r.id} action={deleteRoundAction} confirmMessage="Eliminar esta ronda. ¿Continuar?" />
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
