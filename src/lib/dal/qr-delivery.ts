import "server-only";
import { db } from "@/lib/db";
import { requireRole, ACCREDITATION_ROLES } from "@/lib/dal/auth";
import { accreditationUrl, generateAccreditationQrBuffer } from "@/lib/qr";
import { sendAccreditationEmail, type SendResult } from "@/lib/email";

type DebaterForEmail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  accreditationToken: string;
  teamName: string;
  eventName: string;
  eventDate: string | null;
  venue: string | null;
};

async function loadDebaterForEmail(debaterId: string): Promise<DebaterForEmail | null> {
  const { data, error } = await db
    .from("debaters")
    .select(
      "id, first_name, last_name, email, accreditation_token, teams(team_name, events(name, event_date, venue))"
    )
    .eq("id", debaterId)
    .maybeSingle();

  if (error || !data) return null;
  const team = Array.isArray(data.teams) ? data.teams[0] : data.teams;
  const event = team ? (Array.isArray(team.events) ? team.events[0] : team.events) : null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    accreditationToken: data.accreditation_token,
    teamName: team?.team_name ?? "—",
    eventName: event?.name ?? "TRD La Regional Esmeralda",
    eventDate: event?.event_date ?? null,
    venue: event?.venue ?? null,
  };
}

/**
 * Envía (o reenvía) el correo con el QR de acreditación a un debatiente.
 * No verifica rol de staff — es la función interna que usan tanto el
 * registro público (apenas se inscribe el equipo) como las acciones de
 * staff (que sí verifican rol antes de llamarla, ver más abajo).
 */
async function sendAccreditationEmailForDebater(debaterId: string, origin: string): Promise<SendResult> {
  const debater = await loadDebaterForEmail(debaterId);
  if (!debater) return { ok: false, error: "Participante no encontrado." };
  if (!debater.email) return { ok: false, error: "Este participante no tiene correo registrado." };

  const url = accreditationUrl(debater.accreditationToken, origin);
  const qrBuffer = await generateAccreditationQrBuffer(debater.accreditationToken, origin);
  const qrCid = `qr-${debater.id}`;

  const result = await sendAccreditationEmail({
    to: debater.email,
    fullName: `${debater.firstName} ${debater.lastName}`.trim(),
    teamName: debater.teamName,
    eventName: debater.eventName,
    eventDate: debater.eventDate
      ? new Date(debater.eventDate).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })
      : null,
    venue: debater.venue,
    accreditationUrl: url,
    qrCid,
    qrBuffer,
  });

  if (result.ok) {
    const { data: current } = await db
      .from("debaters")
      .select("qr_sent_count")
      .eq("id", debaterId)
      .maybeSingle();
    await db
      .from("debaters")
      .update({
        qr_sent_at: new Date().toISOString(),
        qr_sent_count: (current?.qr_sent_count ?? 0) + 1,
      })
      .eq("id", debaterId);
  } else {
    console.error(`[qr-delivery] Falló el envío a ${debater.email} (debater ${debaterId}): ${result.error}`);
  }

  return result;
}

/**
 * Envía el correo inicial a todos los debatientes de un equipo recién
 * registrado. Se llama una sola vez, justo después del insert — no
 * bloquea la respuesta al usuario si algún correo falla (se registra el
 * error pero la inscripción ya quedó guardada).
 */
export async function sendInitialAccreditationEmails(
  debaterIds: string[],
  origin: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const id of debaterIds) {
    const result = await sendAccreditationEmailForDebater(id, origin);
    if (result.ok) sent++;
    else failed++;
  }
  return { sent, failed };
}

/** Reenvía el MISMO QR (no genera uno nuevo). Requiere rol de acreditación. */
export async function resendAccreditationEmail(debaterId: string): Promise<SendResult> {
  await requireRole(ACCREDITATION_ROLES);
  const { getOrigin } = await import("@/lib/origin");
  const origin = await getOrigin();
  return sendAccreditationEmailForDebater(debaterId, origin);
}

/**
 * Genera un nuevo token de acreditación (invalidando cualquier QR/correo
 * anterior, que dejará de encontrar al participante) y envía el nuevo
 * QR por correo. Requiere rol de acreditación.
 */
export async function regenerateAccreditationToken(debaterId: string): Promise<SendResult> {
  await requireRole(ACCREDITATION_ROLES);

  const newToken = crypto.randomUUID();
  const { error } = await db
    .from("debaters")
    .update({ accreditation_token: newToken })
    .eq("id", debaterId);
  if (error) return { ok: false, error: error.message };

  const { getOrigin } = await import("@/lib/origin");
  const origin = await getOrigin();
  return sendAccreditationEmailForDebater(debaterId, origin);
}
