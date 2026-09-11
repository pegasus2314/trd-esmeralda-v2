"use client";

import { useActionState, useState } from "react";
import { registerTeamAction } from "@/lib/actions/registration-actions";
import { Field, FormMessage, inputClass } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";

type DebaterRow = { key: number; role: "captain" | "debater" | "alternate" };

export function RegistrationForm() {
  const [state, action, pending] = useActionState(registerTeamAction, undefined);
  const [rows, setRows] = useState<DebaterRow[]>([{ key: 0, role: "debater" }]);
  const [nextKey, setNextKey] = useState(1);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success-bg p-7 text-center">
        <div className="mb-2 text-3xl">✓</div>
        <h2 className="text-xl font-bold text-success">Inscripción enviada</h2>
        <p className="mt-2 text-sm text-muted">
          Quedará pendiente de revisión. La organización te contactará por el correo indicado.
        </p>
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
          <Field label="Correo electrónico">
            <input className={inputClass} type="email" name="coachEmail" required placeholder="coach@centro.edu.do" />
          </Field>
          <Field label="Teléfono">
            <input className={inputClass} name="coachPhone" required placeholder="809-000-0000" />
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
          INTEGRANTES
        </span>
      </div>

      <div className="grid gap-2.5">
        {rows.map((row, i) => (
          <div key={row.key} className="grid grid-cols-1 gap-2.5 rounded-xl border border-line bg-navy-900 p-3.5 md:grid-cols-[1fr_1fr_1.1fr_.8fr_auto]">
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
              type="email"
              name={`debater_email_${i}`}
              placeholder="Correo (opcional)"
              aria-label="Correo del integrante"
            />
            <select className={inputClass} name={`debater_role_${i}`} defaultValue={row.role}>
              <option value="captain">Capitán</option>
              <option value="debater">Debatiente</option>
              <option value="alternate">Suplente</option>
            </select>
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
              disabled={rows.length === 1}
              className="min-h-11 rounded-lg border border-danger/35 px-3.5 font-bold text-[#ff9999] disabled:opacity-40"
              aria-label="Eliminar integrante"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          setRows((r) => [...r, { key: nextKey, role: "debater" }]);
          setNextKey((k) => k + 1);
        }}
        className="mt-3.5 mb-5 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-cyan/50 bg-cyan/5 px-4 py-2.5 text-sm font-extrabold text-cyan"
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
