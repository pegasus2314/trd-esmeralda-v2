import { requireOpsAccess } from "@/components/admin/OpsGate";
import { OpsSubNav } from "@/components/admin/OpsSubNav";
import { listBuses } from "@/lib/dal/operations";
import { createBusAction, deleteBusAction } from "@/lib/actions/operations-actions";
import { Card, Field, inputClass, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";
import { BusStatusPill } from "@/components/admin/BusStatusPill";

export default async function FlotaPage() {
  const gate = await requireOpsAccess();
  if (!gate.ok) return gate.element;

  const buses = await listBuses();
  const counts = {
    base: buses.filter((b) => b.status === "base").length,
    route: buses.filter((b) => b.status === "route").length,
    arrived: buses.filter((b) => b.status === "arrived").length,
  };

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Flota de autobuses</h1>
      <p className="mb-5 text-sm text-muted">Toca el estado de un autobús para avanzarlo (En base → En ruta → Llegó).</p>
      <OpsSubNav />

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <Card className="p-4">
          <span className="block text-[10px] uppercase tracking-wide text-muted">En base</span>
          <strong className="mt-1 block font-display text-3xl">{counts.base}</strong>
        </Card>
        <Card className="p-4">
          <span className="block text-[10px] uppercase tracking-wide text-muted">En ruta</span>
          <strong className="mt-1 block font-display text-3xl text-celeste">{counts.route}</strong>
        </Card>
        <Card className="p-4">
          <span className="block text-[10px] uppercase tracking-wide text-muted">Llegaron</span>
          <strong className="mt-1 block font-display text-3xl text-cyan">{counts.arrived}</strong>
        </Card>
      </div>

      <Card className="mb-5 p-5">
        <h2 className="mb-3 text-sm font-bold">Añadir autobús</h2>
        <form
          action={async (formData) => {
            "use server";
            await createBusAction(formData);
          }}
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-4"
        >
          <Field label="Identificador">
            <input className={inputClass} name="code" required placeholder="Ej. B1" />
          </Field>
          <Field label="Ruta" className="sm:col-span-2">
            <input className={inputClass} name="route" required placeholder="Ej. Sede → Hotel A" />
          </Field>
          <Field label="Capacidad">
            <input className={inputClass} name="capacity" type="number" min={1} placeholder="Ej. 45" />
          </Field>
          <Field label="Llegada estimada" className="sm:col-span-2">
            <input className={inputClass} name="scheduledArrival" type="datetime-local" />
          </Field>
          <Button type="submit" variant="primary" className="sm:col-span-2 sm:self-end">
            Añadir a la flota
          </Button>
        </form>
      </Card>

      {buses.length === 0 ? (
        <EmptyState icon="🚌" title="No hay autobuses registrados todavía." />
      ) : (
        <div className="grid gap-2">
          {buses.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-navy-800 p-4">
              <span className="w-14 font-mono text-lg font-bold">{b.code}</span>
              <div className="min-w-[160px] flex-1">
                <span className="block text-sm text-muted">{b.route}</span>
                {b.scheduledArrival && (
                  <span className="block font-mono text-xs text-cyan">
                    Llegada: {new Date(b.scheduledArrival).toLocaleString("es-DO", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {b.capacity && <span className="block text-xs text-muted">Capacidad: {b.capacity} pasajeros</span>}
              </div>
              <BusStatusPill bus={b} />
              <DeleteRowButton id={b.id} action={deleteBusAction} confirmMessage={`Eliminar el autobús ${b.code}. ¿Continuar?`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
