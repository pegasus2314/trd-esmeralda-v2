import type { Metadata } from "next";
import { getCurrentEvent } from "@/lib/dal/public";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "El torneo" };

const INFO = [
  { icon: "▣", label: "Fecha", value: "28 de abril de 2026" },
  { icon: "◷", label: "Hora", value: "7:30 AM" },
  { icon: "⌖", label: "Lugar", value: "Regional 17 · Monte Plata" },
  { icon: "♙", label: "Modalidad", value: "Torneo Regional de Debate" },
];

export default async function TorneoPage() {
  const event = await getCurrentEvent();

  return (
    <section className="mx-auto w-[92vw] max-w-6xl py-13">
      <SectionHeading
        eyebrow="EL TORNEO"
        title="Información del torneo"
        description="Consulta aquí los datos oficiales de la actividad: cuándo se realiza, dónde será y bajo qué modalidad."
      />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.7fr_.75fr]">
        <div className="rounded-2xl border border-line bg-navy-800 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-xl text-cyan">◉</span>
            <div>
              <h2 className="text-lg font-bold">Datos del evento</h2>
              <p className="text-[11px] text-muted">
                {event ? `Estado: ${event.status === "open" ? "inscripciones abiertas" : "próximamente"}` : "Información oficial del TRD."}
              </p>
            </div>
          </div>
          <div>
            {INFO.map((item, i) => (
              <div key={item.label} className={`relative py-3 pl-9 ${i > 0 ? "border-t border-line" : ""}`}>
                <span className="absolute left-0.5 top-3 text-base text-cyan">{item.icon}</span>
                <b className="block text-[11px] uppercase tracking-wide text-cyan">{item.label}</b>
                <p className="mt-0.5 text-sm text-[#d4e1e8]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-line bg-navy-700 p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-cyan">
            ♢
          </span>
          <p className="my-3.5 text-sm leading-snug">
            El debate nos enseña
            <br />
            <b>
              a escuchar, pensar
              <br />
              y construir un mejor
              <br />
              mañana.
            </b>
          </p>
          <hr className="my-3.5 w-7 border-line-strong" />
          <strong className="text-xs">TRD La Regional Esmeralda</strong>
          <small className="mt-0.5 text-[9px] text-cyan">Regional 17 · Monte Plata</small>
        </div>
      </div>
    </section>
  );
}
