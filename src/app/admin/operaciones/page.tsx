import { requireOpsAccess } from "@/components/admin/OpsGate";
import { OpsSubNav } from "@/components/admin/OpsSubNav";
import { getOpsOverview } from "@/lib/dal/operations";
import { Card } from "@/components/ui/primitives";

function Stat({ label, value, tone }: { label: string; value: number; tone?: "cyan" | "celeste" | "danger" }) {
  const color = tone === "cyan" ? "text-cyan" : tone === "danger" ? "text-danger" : tone === "celeste" ? "text-celeste" : "text-ink";
  return (
    <Card className="p-4">
      <span className="block text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <strong className={`mt-1 block font-display text-3xl ${color}`}>{value}</strong>
    </Card>
  );
}

export default async function OperacionesPage() {
  const gate = await requireOpsAccess();
  if (!gate.ok) return gate.element;

  const overview = await getOpsOverview();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Centro de Operaciones</h1>
      <p className="mb-5 text-sm text-muted">Estado general del operativo del evento.</p>
      <OpsSubNav />

      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <Stat label="En base" value={overview.busCounts.base} />
        <Stat label="En ruta" value={overview.busCounts.route} tone="celeste" />
        <Stat label="Llegaron" value={overview.busCounts.arrived} tone="cyan" />
        <Stat label="Incidencias abiertas" value={overview.openIncidents} tone="danger" />
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-bold">Próximo en la agenda</h2>
        {overview.nextItem ? (
          <div className="flex gap-3.5 text-sm">
            <time className="w-32 flex-shrink-0 font-mono text-cyan">
              {new Date(overview.nextItem.scheduledAt).toLocaleString("es-DO", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </time>
            <span>{overview.nextItem.description}</span>
          </div>
        ) : (
          <p className="text-sm text-muted">No hay próximos eventos en el cronograma.</p>
        )}
      </Card>
    </div>
  );
}
