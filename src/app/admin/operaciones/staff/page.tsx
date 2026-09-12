import { requireOpsAccess } from "@/components/admin/OpsGate";
import { OpsSubNav } from "@/components/admin/OpsSubNav";
import { listStaffDirectory } from "@/lib/dal/operations";
import { Card, EmptyState } from "@/components/ui/primitives";

export default async function OpsStaffPage() {
  const gate = await requireOpsAccess();
  if (!gate.ok) return gate.element;

  const groups = await listStaffDirectory();

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Directorio de staff</h1>
      <p className="mb-5 text-sm text-muted">
        Asignaciones actuales por grupo. Para añadir o quitar personas, hazlo desde{" "}
        <span className="text-cyan">Mapas → Asignar personal a un punto</span>.
      </p>
      <OpsSubNav />

      {groups.length === 0 ? (
        <EmptyState icon="🧑‍🤝‍🧑" title="No hay personal asignado todavía." />
      ) : (
        <div className="grid gap-5">
          {groups.map((g) => (
            <div key={g.group}>
              <h2 className="mb-2.5 text-sm font-bold text-cyan">{g.group}</h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {g.people.map((p) => (
                  <Card key={p.id} className="p-4">
                    <strong className="block text-sm">{p.name}</strong>
                    <span className="mt-1 block text-xs text-muted">{p.pointLabel}</span>
                    {p.note && <span className="mt-1 block text-xs text-muted">{p.note}</span>}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
