import Link from "next/link";
import { getApprovedTeams, getCurrentEvent } from "@/lib/dal/public";
import { Eyebrow } from "@/components/ui/primitives";

const CARDS = [
  {
    href: "/inscripcion",
    icon: "♟",
    title: "Inscripción",
    description: "Registra tu equipo, centro educativo, docente coach e integrantes.",
    cta: "Registrar equipo →",
  },
  {
    href: "/participantes",
    icon: "♙",
    title: "Participantes",
    description: "Consulta los equipos que ya fueron aprobados y publicados.",
    cta: "Ver equipos →",
  },
  {
    href: "/torneo",
    icon: "◉",
    title: "El torneo",
    description: "Consulta la fecha, hora, lugar y modalidad oficial del TRD.",
    cta: "Ver información →",
  },
  {
    href: "/logistica",
    icon: "⌖",
    title: "Logística",
    description: "Consulta cómo prepararte para llegar, acreditarte y moverte durante la jornada.",
    cta: "Ver logística →",
  },
];

export default async function HomePage() {
  const [event, teams] = await Promise.all([getCurrentEvent(), getApprovedTeams()]);

  return (
    <div>
      <section className="relative min-h-[380px] overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/hero-debate.svg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/90 to-navy-900/55" />
        <div className="relative z-10 mx-auto grid min-h-[380px] w-[92vw] max-w-6xl grid-cols-1 items-center gap-8 py-10 md:grid-cols-[120px_1fr]">
          <img src="/logo-regional17.svg" alt="Regional 17" className="hidden h-[120px] w-[120px] md:block" />
          <div className="max-w-2xl">
            <Eyebrow>TORNEO REGIONAL DE DEBATE</Eyebrow>
            <h1 className="mt-2 font-display text-5xl leading-[0.96] md:text-6xl">
              La Regional <em className="text-cyan not-italic">Esmeralda</em>
            </h1>
            <h3 className="mt-2.5 text-lg font-semibold text-celeste">Regional 17 · Monte Plata</h3>
            <p className="mt-2 text-base font-bold text-white">
              Ideas que construyen, argumentos que inspiran.
            </p>
            <p className="mt-1.5 max-w-lg text-sm text-[#c0d0da]">
              Gestiona tu participación en el TRD, consulta los equipos aprobados y revisa la
              información oficial del torneo.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/inscripcion"
                className="inline-flex min-h-12.5 items-center gap-2 rounded-xl border border-cyan bg-cyan px-5 font-bold text-cyan-ink"
              >
                ♟ Inscribir equipo →
              </Link>
              <Link
                href="/participantes"
                className="inline-flex min-h-12.5 items-center gap-2 rounded-xl border border-line-strong px-5 font-bold text-ink hover:bg-cyan/10 hover:border-cyan"
              >
                ♙ Ver participantes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[92vw] max-w-6xl py-13">
        <div className="mb-7 max-w-2xl">
          <Eyebrow>TRD LA REGIONAL ESMERALDA</Eyebrow>
          <h2 className="mt-1.5 font-display text-4xl">¿Qué necesitas hacer?</h2>
          <p className="mt-2 text-sm text-muted">
            Selecciona una opción. Cada botón abre únicamente la información y las funciones
            correspondientes.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex min-h-[180px] flex-col rounded-2xl border border-line bg-navy-800 p-5.5 transition hover:border-line-strong hover:bg-navy-700"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-lg text-cyan">
                {card.icon}
              </span>
              <b className="mt-4 text-lg">{card.title}</b>
              <small className="mt-1.5 text-xs leading-relaxed text-muted">{card.description}</small>
              <strong className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-bold text-cyan">
                {card.cta}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      {event && teams.length > 0 && (
        <section className="mx-auto w-[92vw] max-w-6xl pb-13">
          <div className="mb-5">
            <Eyebrow>PARTICIPANTES</Eyebrow>
            <h2 className="mt-1.5 font-display text-3xl">Equipos aprobados</h2>
            <p className="mt-1.5 text-sm text-muted">
              Equipos publicados oficialmente para el {event.name}.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <article key={team.id} className="rounded-xl border border-line bg-navy-800 p-4.5">
                <span className="block text-[9px] font-black tracking-wide text-cyan">
                  ● EQUIPO APROBADO
                </span>
                <h3 className="mt-2 text-xl font-bold">{team.teamName}</h3>
                <p className="mt-1 text-xs text-muted">
                  {team.schoolName}
                  {team.district ? ` · ${team.district}` : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
