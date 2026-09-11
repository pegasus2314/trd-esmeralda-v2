import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Logística" };

const ARRIVAL_STEPS = [
  { n: "01", title: "Llega con anticipación", text: "La jornada está programada para iniciar a las 7:30 AM. Procura disponer de tiempo para completar el proceso de llegada." },
  { n: "02", title: "Completa tu acreditación", text: "Ten disponible el código QR de tu participante y sigue las instrucciones del equipo encargado de acreditación." },
  { n: "03", title: "Confirma tu equipo", text: "Verifica que estás registrado con el equipo y centro educativo correspondientes." },
  { n: "04", title: "Sigue la orientación", text: "El personal de logística te indicará las áreas y el flujo que corresponde durante la jornada." },
];

const CHECKLIST = [
  { title: "Inscripción aprobada", text: "Confirma que tu equipo aparece entre los participantes publicados." },
  { title: "QR disponible", text: "Ten a mano tu código QR individual para facilitar la acreditación." },
  { title: "Datos correctos", text: "Verifica previamente tu nombre, equipo y centro educativo." },
  { title: "Atención a las indicaciones", text: "Durante toda la jornada, sigue las instrucciones oficiales del personal del torneo." },
];

const FLOW = [
  { n: 1, title: "Llegada", text: "Ingreso a la sede y ubicación del punto de atención." },
  { n: 2, title: "Acreditación", text: "Validación del participante y registro de asistencia." },
  { n: 3, title: "Orientación", text: "Indicaciones sobre áreas, horarios y funcionamiento de la jornada." },
  { n: 4, title: "Participación", text: "Integración al desarrollo del torneo según las indicaciones oficiales." },
];

function StepCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-line bg-navy-800 p-6">
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-lg text-cyan">
        {icon}
      </span>
      <h3 className="text-xl font-bold">{title}</h3>
      {children}
    </article>
  );
}

export default function LogisticaPage() {
  return (
    <section className="mx-auto w-[92vw] max-w-6xl py-13">
      <SectionHeading
        eyebrow="LOGÍSTICA"
        title="Prepárate para la jornada"
        description="Toda la información operativa para llegar, completar tu acreditación y seguir el flujo de la actividad sin perderte."
      />
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        <StepCard icon="⌖" title="Llegada y acceso">
          <p className="mt-1.5 mb-4 text-sm text-muted">
            Al llegar a la sede, sigue las indicaciones del personal de logística y dirígete al
            punto de acreditación.
          </p>
          <div className="grid gap-2.5">
            {ARRIVAL_STEPS.map((s) => (
              <div key={s.n} className="grid grid-cols-[30px_1fr] gap-2.5 rounded-lg border border-line bg-navy-900 p-3">
                <span className="grid h-6.5 w-6.5 place-items-center rounded-md bg-cyan/10 text-xs text-cyan">
                  {s.n}
                </span>
                <div>
                  <strong className="text-[12.5px]">{s.title}</strong>
                  <small className="mt-0.5 block text-[11px] leading-relaxed text-muted-2">{s.text}</small>
                </div>
              </div>
            ))}
          </div>
        </StepCard>
        <StepCard icon="✓" title="Antes de salir">
          <p className="mt-1.5 mb-4 text-sm text-muted">Revisa estos puntos para llegar preparado al TRD.</p>
          <div className="grid gap-2.5">
            {CHECKLIST.map((c) => (
              <div key={c.title} className="grid grid-cols-[30px_1fr] gap-2.5 rounded-lg border border-line bg-navy-900 p-3">
                <span className="grid h-6.5 w-6.5 place-items-center rounded-md bg-cyan/10 text-xs text-cyan">
                  ✓
                </span>
                <div>
                  <strong className="text-[12.5px]">{c.title}</strong>
                  <small className="mt-0.5 block text-[11px] leading-relaxed text-muted-2">{c.text}</small>
                </div>
              </div>
            ))}
          </div>
        </StepCard>
      </div>

      <article className="mt-3.5 rounded-2xl border border-line bg-navy-800 p-6">
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-lg text-cyan">
          →
        </span>
        <h3 className="text-xl font-bold">Flujo de la jornada</h3>
        <p className="mt-1.5 mb-4 text-sm text-muted">
          El proceso está pensado para que puedas avanzar de forma clara desde tu llegada hasta tu
          participación.
        </p>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {FLOW.map((f) => (
            <div key={f.n} className="rounded-xl border border-line bg-navy-900 p-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan/10 font-display text-base text-cyan">
                {f.n}
              </span>
              <strong className="mt-2.5 block text-[12.5px]">{f.title}</strong>
              <small className="mt-1 block text-[10px] leading-relaxed text-muted-2">{f.text}</small>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-cyan/15 bg-cyan/5 p-4 text-[12px] leading-relaxed text-celeste">
          <strong className="text-cyan">Importante:</strong> las indicaciones del personal de
          logística durante el evento tendrán prioridad ante cualquier información general
          publicada en esta sección.
        </div>
      </article>
    </section>
  );
}
