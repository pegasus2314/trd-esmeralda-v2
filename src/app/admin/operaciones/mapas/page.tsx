import { requireOpsAccess } from "@/components/admin/OpsGate";
import { OpsSubNav } from "@/components/admin/OpsSubNav";
import { listVenues } from "@/lib/dal/operations";
import {
  createVenueAction,
  deleteVenueAction,
  createPointAction,
  deletePointAction,
  addAssignmentAction,
  deleteAssignmentAction,
} from "@/lib/actions/operations-actions";
import { Card, Field, inputClass, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";
import { OpsFloorplan } from "@/components/admin/OpsFloorplan";

export default async function MapasPage() {
  const gate = await requireOpsAccess();
  if (!gate.ok) return gate.element;

  const venues = await listVenues();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Mapas por sede</h1>
      <p className="mb-5 text-sm text-muted">Toca un punto en el plano para ver quién está asignado ahí.</p>
      <OpsSubNav />

      {venues.length === 0 ? (
        <EmptyState icon="🗺️" title="No hay sedes creadas todavía." />
      ) : (
        <OpsFloorplan venues={venues} />
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold">Nueva sede</h2>
          <form
            action={async (formData) => {
              "use server";
              await createVenueAction(formData);
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <Field label="Nombre" className="flex-1 min-w-[160px]">
              <input className={inputClass} name="name" required placeholder="Ej. Hotel A" />
            </Field>
            <Button type="submit" variant="primary">
              Crear
            </Button>
          </form>
          <div className="mt-4 grid gap-2">
            {venues.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-line bg-black/10 p-3">
                <span className="text-sm">{v.name}</span>
                <DeleteRowButton id={v.id} action={deleteVenueAction} confirmMessage={`Eliminar la sede "${v.name}" y todos sus puntos. ¿Continuar?`} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-bold">Nuevo punto</h2>
          {venues.length === 0 ? (
            <p className="text-sm text-muted">Crea primero una sede.</p>
          ) : (
            <form
              action={async (formData) => {
                "use server";
                await createPointAction(formData);
              }}
              className="grid grid-cols-2 gap-2.5"
            >
              <Field label="Sede" className="col-span-2">
                <select className={inputClass} name="venueId" required defaultValue={venues[0].id}>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Código">
                <input className={inputClass} name="code" required placeholder="Ej. LBY" />
              </Field>
              <Field label="Nombre">
                <input className={inputClass} name="name" required placeholder="Ej. Lobby" />
              </Field>
              <Field label="Tipo" className="col-span-2">
                <select className={inputClass} name="type" defaultValue="room">
                  <option value="entry">Entrada / acceso</option>
                  <option value="corridor">Corredor</option>
                  <option value="room">Salón / habitaciones</option>
                  <option value="service">Servicio / parqueo</option>
                </select>
              </Field>
              <Field label="X">
                <input className={inputClass} name="x" type="number" defaultValue={20} />
              </Field>
              <Field label="Y">
                <input className={inputClass} name="y" type="number" defaultValue={20} />
              </Field>
              <Field label="Ancho">
                <input className={inputClass} name="w" type="number" defaultValue={120} />
              </Field>
              <Field label="Alto">
                <input className={inputClass} name="h" type="number" defaultValue={70} />
              </Field>
              <Button type="submit" variant="primary" className="col-span-2">
                Añadir punto
              </Button>
            </form>
          )}
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 text-sm font-bold">Asignar personal a un punto</h2>
        {venues.every((v) => v.points.length === 0) ? (
          <p className="text-sm text-muted">Crea primero al menos un punto.</p>
        ) : (
          <form
            action={async (formData) => {
              "use server";
              await addAssignmentAction(formData);
            }}
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-4"
          >
            <Field label="Punto" className="sm:col-span-2">
              <select className={inputClass} name="pointId" required>
                {venues.map((v) => (
                  <optgroup key={v.id} label={v.name}>
                    {v.points.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} · {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Nombre">
              <input className={inputClass} name="displayName" required placeholder="Nombre y apellido" />
            </Field>
            <Field label="Grupo (opcional)">
              <input className={inputClass} name="groupLabel" placeholder="Ej. Coordinación" />
            </Field>
            <Field label="Nota (opcional)" className="sm:col-span-4">
              <input className={inputClass} name="note" placeholder="Ej. mínimo 2 personas" />
            </Field>
            <Button type="submit" variant="primary" className="sm:col-span-4 sm:w-fit">
              Asignar
            </Button>
          </form>
        )}

        <div className="mt-4 grid gap-2">
          {venues.flatMap((v) =>
            v.points.flatMap((p) =>
              p.assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-line bg-black/10 p-3">
                  <div className="min-w-0 text-sm">
                    <strong>{a.displayName}</strong>
                    <span className="ml-2 text-xs text-muted">
                      {v.name} — {p.code} {p.name}
                      {a.groupLabel ? ` · ${a.groupLabel}` : ""}
                    </span>
                  </div>
                  <DeleteRowButton id={a.id} action={deleteAssignmentAction} confirmMessage="Quitar esta asignación. ¿Continuar?" />
                </div>
              ))
            )
          )}
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 text-sm font-bold">Eliminar puntos</h2>
        <div className="grid gap-2">
          {venues.flatMap((v) =>
            v.points.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-line bg-black/10 p-3">
                <span className="text-sm">
                  {v.name} — <strong>{p.code}</strong> {p.name}
                </span>
                <DeleteRowButton id={p.id} action={deletePointAction} confirmMessage={`Eliminar el punto "${p.name}". ¿Continuar?`} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
