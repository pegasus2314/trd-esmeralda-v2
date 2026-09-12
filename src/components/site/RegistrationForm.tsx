"use client";

import { useActionState, useState } from "react";
import { registerTeamAction } from "@/lib/actions/registration-actions";
import { SUBJECT_AREAS } from "@/lib/validation";
import { Field, FormMessage, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

const MIN_DEBATERS = 3;
const MAX_DEBATERS = 5;

type DebaterRow = { key: number; role: "captain" | "debater" | "alternate" };

let seedKey = 0;
function makeInitialRows(): DebaterRow[] {
  return Array.from({ length: MIN_DEBATERS }, () => ({ key: seedKey++, role: "debater" as const }));
}

export function RegistrationForm() {
  const [state, action, pending] = useActionState(registerTeamAction, undefined);
  const [rows, setRows] = useState<DebaterRow[]>(makeInitialRows);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success-bg p-7 text-center">
        <div className="mb-2 text-3xl">✓</div>
        <h2 className="text-xl font-bold text-success">Inscripción enviada</h2>
        <p className="mt-2 text-sm text-muted">
          Quedará pendiente de revisión. Cada integrante con correo registrado recibirá su código
          QR de acreditación por email.
        </p>
        {!!state.emailsFailed && (
          <p className="mt-3 text-xs text-warning">
            {state.emailsFailed === 1
              ? "No se pudo enviar el correo a un integrante — se le puede reenviar desde el panel administrativo."
              : `No se pudo enviar el correo a ${state.emailsFailed} integrantes — se les puede reenviar desde el panel administrativo.`}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-line bg-navy-800 p-7">
      <input type="hidden" name="debaterCount" value={rows.length} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nombre del equipo">
          <input className={inputClass} name="teamName" required placeholder="Ej. Los Argumentadores" />
        </Field>
        <Field label="Centro educativo">
          <input className={inputClass} name="schoolName" required placeholder="Nombre del centro" />
        </Field>
        <Field label="Distrito educativo">
          <input className={inputClass} name="district" placeholder="Ej. 17-04" />
        </Field>
        <Field label="Responsable">
          <input className={inputClass} name="contactName" required placeholder="Nombre completo" />
        </Field>
        <Field label="Correo de contacto">
          <input className={inputClass} type="email" name="contactEmail" required placeholder="correo@ejemplo.com" />
        </Field>
        <Field label="Teléfono">
          <input className={inputClass} name="contactPhone" placeholder="809-000-0000" />
        </Field>
      </div>

      <div className="relative my-7 border-t border-line">
        <span className="absolute -top-2.5 bg-navy-800 pr-2.5 text-[10px] font-extrabold tracking-[0.16em] text-cyan">
          DOCENTE COACH
        </span>
      </div>

      <div className="rounded-xl border border-line bg-navy-900 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nombre completo">
            <input className={inputClass} name="coachName" required placeholder="Nombre y apellidos" />
          </Field>
          <Field label="Cédula">
            <input className={inputClass} name="coachIdNumber" required placeholder="000-0000000-0" />
          </Field>
          <Field label="Correo electrónico">
            <input className={inputClass} type="email" name="coachEmail" required placeholder="coach@centro.edu.do" />
          </Field>
          <Field label="Teléfono">
            <input className={inputClass} name="coachPhone" required placeholder="809-000-0000" />
          </Field>
          <Field label="Área curricular">
            <select className={inputClass} name="coachSubjectArea" required defaultValue="">
              <option value="" disabled>
                Selecciona un área
              </option>
              {SUBJECT_AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Centro educativo">
            <input className={inputClass} name="coachSchool" required placeholder="Centro educativo" />
          </Field>
          <Field label="Distrito educativo">
            <input className={inputClass} name="coachDistrict" placeholder="Ej. 17-04" />
          </Field>
        </div>
      </div>

      <div className="relative my-7 border-t border-line">
        <span className="absolute -top-2.5 bg-navy-800 pr-2.5 text-[10px] font-extrabold tracking-[0.16em] text-cyan">
          INTEGRANTES (MÍNIMO {MIN_DEBATERS}, MÁXIMO {MAX_DEBATERS})
        </span>
      </div>

      <div className="grid gap-3">
        {rows.map((row, i) => (
          <div key={row.key} className="rounded-xl border border-line bg-navy-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan">Integrante {i + 1}</span>
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                disabled={rows.length <= MIN_DEBATERS}
                className="rounded-lg border border-danger/35 px-3 py-1 text-xs font-bold text-[#ff9999] disabled:opacity-40"
                aria-label="Eliminar integrante"
              >
                Quitar
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
              <input
                className={inputClass}
                name={`debater_first_${i}`}
                required
                placeholder="Nombre"
                aria-label="Nombre del integrante"
              />
              <input
                className={inputClass}
                name={`debater_last_${i}`}
                required
                placeholder="Apellido"
                aria-label="Apellido del integrante"
              />
              <input
                className={inputClass}
                name={`debater_grade_${i}`}
                required
                placeholder="Curso/grado (ej. 4to Bachillerato)"
                aria-label="Curso del integrante"
              />
              <input
                className={inputClass}
                type="email"
                name={`debater_email_${i}`}
                required
                placeholder="Correo (para su QR)"
                aria-label="Correo del integrante"
              />
              <input
                className={inputClass}
                name={`debater_phone_${i}`}
                required
                placeholder="Teléfono"
                aria-label="Teléfono del integrante"
              />
              <input
                className={inputClass}
                name={`debater_id_number_${i}`}
                required
                placeholder="Cédula (000-0000000-0)"
                aria-label="Cédula del integrante"
              />
              <input
                className={inputClass}
                name={`debater_allergies_${i}`}
                placeholder="Alergias (si aplica)"
                aria-label="Alergias del integrante"
              />
              <input
                className={inputClass}
                name={`debater_medications_${i}`}
                placeholder="Medicamentos (si aplica)"
                aria-label="Medicamentos del integrante"
              />
              <select className={inputClass} name={`debater_role_${i}`} defaultValue={row.role} aria-label="Rol del integrante">
                <option value="captain">Capitán</option>
                <option value="debater">Debatiente</option>
                <option value="alternate">Suplente</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { key: seedKey++, role: "debater" }])}
        disabled={rows.length >= MAX_DEBATERS}
        className="mt-3.5 mb-5 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-cyan/50 bg-cyan/5 px-4 py-2.5 text-sm font-extrabold text-cyan disabled:opacity-40"
      >
        ＋ Añadir integrante
      </button>

      <label className="mb-2.5 flex items-start gap-2.5 rounded-lg border border-line bg-navy-900 p-3.5 text-xs text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 accent-cyan" />
        Confirmo que los datos suministrados son correctos y autorizo su uso para la gestión del
        TRD.
      </label>
      <label className="mb-5 flex items-start gap-2.5 rounded-lg border border-line bg-navy-900 p-3.5 text-xs text-muted">
        <input type="checkbox" name="coachConsent" required className="mt-0.5 accent-cyan" />
        Confirmo que el docente Coach ha autorizado su registro y participación en el torneo.
      </label>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Enviando…" : "Enviar inscripción →"}
        </Button>
        <FormMessage tone="error">{state?.error}</FormMessage>
      </div>
    </form>
  );
}
