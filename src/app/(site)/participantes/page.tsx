import type { Metadata } from "next";
import { getApprovedDebaters } from "@/lib/dal/public";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Participantes" };

export default async function ParticipantesPage() {
  const debaters = await getApprovedDebaters();

  const teams = new Map<string, { teamName: string; members: typeof debaters }>();
  for (const d of debaters) {
    if (!teams.has(d.teamId)) teams.set(d.teamId, { teamName: d.teamName, members: [] });
    teams.get(d.teamId)!.members.push(d);
  }
  const teamList = [...teams.values()];

  return (
    <section className="mx-auto w-[92vw] max-w-6xl py-13">
      <SectionHeading
        eyebrow="PARTICIPANTES"
        title="Equipos y participantes"
        description="Consulta cada equipo aprobado y sus integrantes."
      />

      {teamList.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Aún no hay equipos publicados"
          description="Los equipos aparecerán aquí cuando sean aprobados por administración."
        />
      ) : (
        <div className="rounded-2xl border border-line bg-navy-800 p-5">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3.5">
            <div>
              <span className="block text-[10px] font-black uppercase tracking-wide text-cyan">
                Publicado
              </span>
              <h3 className="mt-1 text-xl font-bold">Equipos registrados</h3>
            </div>
            <span className="rounded-full bg-cyan/10 px-2.5 py-1.5 text-[10px] font-black text-cyan">
              {teamList.length} equipos
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            {teamList.map((team, idx) => (
              <article key={idx} className="overflow-hidden rounded-xl border border-line bg-navy-900">
                <header className="flex items-center gap-3 border-b border-line p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10">
                    👥
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] font-black uppercase text-cyan">Equipo</span>
                    <h3 className="truncate text-lg font-bold">{team.teamName}</h3>
                  </div>
                  <span className="whitespace-nowrap text-[9px] uppercase text-muted-2">
                    {team.members.length} integrantes
                  </span>
                </header>
                <div className="px-3 py-1">
                  {team.members.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2.5 border-b border-line py-2.5 last:border-0">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-xs font-bold">
                        {i + 1}
                      </span>
                      <strong className="text-sm">{m.fullName}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
