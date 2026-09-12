import { requireOpsAccess } from "@/components/admin/OpsGate";
import { OpsSubNav } from "@/components/admin/OpsSubNav";
import { listIncidents, listVenues } from "@/lib/dal/operations";
import { createIncidentAction } from "@/lib/actions/operations-actions";
import { Card, Field, inputClass, EmptyState, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { ResolveIncidentButton } from "@/components/admin/ResolveIncidentButton";

export default async function IncidenciasPage() {
  const gate = await requireOpsAccess();
  if (!gate.ok) return gate.element;

  const [incidents, venues] = await Promise.all([listIncidents(), listVenues()]);
  const open = incidents.filter((i) => i.status === "open");
  const resolved = incidents.filter((i) => i.status === "resolved");

  return (
    <div>
      <h1 className="mb-1 font-display text-3xl">Incidencias</h1>
      <p className="mb-5 text-sm text-muted">Toda incidencia reportada queda registrada con quién y cuándo la reportó.</p>
      <OpsSubNav />

      <Card className="mb-6 p-5">
        <h2 className="mb-3 text-sm font-bold">Reportar incidencia</h2>
        <form
          action={async (formData) => {
            "use server";
            await createIncidentAction(formData);
          }}
          className="grid max-w-lg gap-2.5"
        >
          <Field label="Punto o ubicación">
            <select className={inputClass} name="locationLabel" required defaultValue="">
              <option value="" disabled>
                Selecciona un punto...
              </option>
              {venues.flatMap((v) =>
                v.points.map((p) => (
                  <option key={p.id} value={`${v.name} — ${p.code} ${p.name}`}>
                    {v.name} — {p.code} {p.name}
                  </option>
                ))
              )}
              <option value="Otro">Otro / no listado</option>
            </select>
          </Field>
          <Field label="Descripción">
            <textarea className={inputClass} name="description" rows={3} required placeholder="¿Qué está pasando?" />
          </Field>
          <Button type="submit" variant="primary" className="w-fit">
            Enviar incidencia
          </Button>
        </form>
      </Card>

      <h2 className="mb-3 text-sm font-bold">
        Abiertas <span className="text-danger">({open.length})</span>
      </h2>
      {open.length === 0 ? (
        <EmptyState title="No hay incidencias abiertas." />
      ) : (
        <div className="mb-6 grid gap-2">
          {open.map((i) => (
            <Card key={i.id} className="border-l-4 border-l-danger p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="block font-mono text-[11px] text-muted">
                    {new Date(i.createdAt).toLocaleString("es-DO")} · {i.locationLabel} · reportado por {i.reporterName}
                  </span>
                  <p className="mt-1 text-sm">{i.description}</p>
                </div>
                <ResolveIncidentButton id={i.id} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-bold text-muted">Resueltas ({resolved.length})</h2>
          <div className="grid gap-2">
            {resolved.map((i) => (
              <Card key={i.id} className="p-4 opacity-70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="block font-mono text-[11px] text-muted">
                    {i.locationLabel} · reportado por {i.reporterName}
                  </span>
                  <Badge tone="success">Resuelta</Badge>
                </div>
                <p className="mt-1 text-sm">{i.description}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
