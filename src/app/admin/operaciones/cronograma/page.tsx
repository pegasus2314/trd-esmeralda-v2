import { requireOpsAccess } from "@/components/admin/OpsGate";
import { OpsSubNav } from "@/components/admin/OpsSubNav";
import { listScheduleItems } from "@/lib/dal/operations";
import { createScheduleItemAction, deleteScheduleItemAction } from "@/lib/actions/operations-actions";
import { Card, Field, inputClass, EmptyState } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";

export default async function CronogramaPage() {
  const gate = await requireOpsAccess();
  if (!gate.ok) return gate.element;

  const items = await listScheduleItems();

  const byDay = new Map<string, typeof items>();
  for (const item of items) {
    const dayKey = new Date(item.scheduledAt).toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
    const list = byDay.get(dayKey) ?? [];
    list.push(item);
    byDay.set(dayKey, list);
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Cronograma oficial</h1>
      <p className="mb-5 text-sm text-muted">Actividades del evento, agrupadas automáticamente por día.</p>
      <OpsSubNav />

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-bold">Añadir actividad</h2>
        <form
          action={async (formData) => {
            "use server";
            await createScheduleItemAction(formData);
          }}
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
        >
          <Field label="Fecha y hora">
            <input className={inputClass} name="scheduledAt" type="datetime-local" required />
          </Field>
          <Field label="Actividad" className="sm:col-span-2">
            <input className={inputClass} name="description" required placeholder="Ej. Llegada de participantes" />
          </Field>
          <Button type="submit" variant="primary" className="sm:w-fit">
            Añadir
          </Button>
        </form>
      </Card>

      {byDay.size === 0 ? (
        <EmptyState icon="🗓️" title="No hay actividades en el cronograma todavía." />
      ) : (
        [...byDay.entries()].map(([day, dayItems]) => (
          <Card key={day} className="mb-4 p-5">
            <h2 className="mb-3 text-sm font-bold capitalize">{day}</h2>
            <div className="border-l-2 border-line pl-4.5">
              {dayItems.map((item) => (
                <div key={item.id} className="relative mb-4 last:mb-0">
                  <div className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-cyan" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <time className="font-mono text-xs text-cyan">
                        {new Date(item.scheduledAt).toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                      </time>
                      <p className="mt-0.5 text-sm">{item.description}</p>
                    </div>
                    <DeleteRowButton id={item.id} action={deleteScheduleItemAction} confirmMessage="Eliminar esta actividad. ¿Continuar?" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
