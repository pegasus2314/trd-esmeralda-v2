import { listMatches, listRounds, listApprovedTeamsForMatches } from "@/lib/dal/admin";
import { createMatchAction, deleteMatchAction } from "@/lib/actions/admin-actions";
import { Card, Field, inputClass, EmptyState, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { DeleteRowButton } from "@/components/admin/DeleteRowButton";

export default async function EnfrentamientosPage() {
  const [matches, rounds, teams] = await Promise.all([
    listMatches(),
    listRounds(),
    listApprovedTeamsForMatches(),
  ]);

  return (
    <div>
      <h1 className="mb-5 font-display text-3xl">Enfrentamientos</h1>

      <Card className="mb-5 p-5">
        {rounds.length === 0 || teams.length < 2 ? (
          <p className="text-sm text-muted">
            Necesitas al menos una ronda creada y dos equipos aprobados para armar enfrentamientos.
          </p>
        ) : (
          <form
            action={async (formData) => {
              "use server";
              await createMatchAction(formData);
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-4"
          >
            <Field label="Ronda">
              <select className={inputClass} name="roundId" required>
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.roundNumber}. {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Equipo A">
              <select className={inputClass} name="teamAId" required>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Equipo B">
              <select className={inputClass} name="teamBId" required>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sala">
              <input className={inputClass} name="room" placeholder="Ej. Aula 4" />
            </Field>
            <Button type="submit" variant="primary" className="sm:col-span-4 sm:w-fit">
              Crear enfrentamiento
            </Button>
          </form>
        )}
      </Card>

      {matches.length === 0 ? (
        <EmptyState title="No hay enfrentamientos creados." />
      ) : (
        <div className="overflow-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[10.5px] uppercase text-muted">
                <th className="p-3">Ronda</th>
                <th className="p-3">Equipo A</th>
                <th className="p-3">Equipo B</th>
                <th className="p-3">Sala</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="p-3">{m.roundName}</td>
                  <td className="p-3">{m.teamAName ?? "—"}</td>
                  <td className="p-3">{m.teamBName ?? "—"}</td>
                  <td className="p-3 text-muted">{m.room ?? "—"}</td>
                  <td className="p-3">
                    <Badge>{m.status}</Badge>
                  </td>
                  <td className="p-3">
                    <DeleteRowButton id={m.id} action={deleteMatchAction} confirmMessage="¿Eliminar este enfrentamiento?" />
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
