import "server-only";
import { db } from "@/lib/db";
import { getCurrentEvent } from "@/lib/dal/public";
import { RegistrationSchema, type RegistrationInput } from "@/lib/validation";

export type CreateRegistrationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Inserción pública de un equipo nuevo. Nadie autenticado necesita estar
 * aquí — esto es exactamente el equivalente del "insert público" del
 * sistema anterior, pero ahora corre en el servidor con la service role,
 * así que el status siempre se fuerza a "pending" y accreditation_status
 * de cada debatiente siempre queda en su default: nunca llega desde el
 * cliente, a diferencia del sistema viejo donde un POST manipulado podía
 * autoasignarse "accredited" desde el registro.
 */
export async function createRegistration(
  input: RegistrationInput
): Promise<CreateRegistrationResult> {
  const parsed = RegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const event = await getCurrentEvent();
  if (!event) return { ok: false, error: "El evento no está disponible." };
  if (event.status !== "open") {
    return { ok: false, error: "Las inscripciones no están abiertas en este momento." };
  }

  const { data: team, error: teamError } = await db
    .from("teams")
    .insert({
      event_id: event.id,
      team_name: data.teamName,
      school_name: data.schoolName,
      district: data.district || null,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (teamError || !team) {
    return { ok: false, error: "No se pudo registrar el equipo: " + (teamError?.message ?? "error desconocido") };
  }

  const { error: coachError } = await db.from("coaches").insert({
    team_id: team.id,
    full_name: data.coachName,
    email: data.coachEmail,
    phone: data.coachPhone,
    school_name: data.coachSchool,
    district: data.coachDistrict || data.district || null,
    consent: true,
  });
  if (coachError) {
    return { ok: false, error: "No se pudo registrar el coach: " + coachError.message };
  }

  const { error: debatersError } = await db.from("debaters").insert(
    data.debaters.map((d) => ({
      team_id: team.id,
      first_name: d.firstName,
      last_name: d.lastName,
      email: d.email || null,
      role: d.role,
      consent: true,
    }))
  );
  if (debatersError) {
    return { ok: false, error: "No se pudieron registrar los integrantes: " + debatersError.message };
  }

  const { error: regError } = await db.from("registrations").insert({
    event_id: event.id,
    team_id: team.id,
    status: "pending",
    payload: { team_name: data.teamName, school_name: data.schoolName },
  });
  if (regError) {
    return { ok: false, error: "No se pudo registrar la solicitud: " + regError.message };
  }

  return { ok: true };
}

export async function countRegisteredAtSchool(schoolName: string): Promise<number> {
  const event = await getCurrentEvent();
  if (!event || !schoolName.trim()) return 0;

  const { data: teams } = await db
    .from("teams")
    .select("id")
    .eq("event_id", event.id)
    .ilike("school_name", schoolName.trim())
    .neq("status", "rejected");

  const teamIds = (teams ?? []).map((t) => t.id);
  if (!teamIds.length) return 0;

  const { count } = await db
    .from("debaters")
    .select("id", { count: "exact", head: true })
    .in("team_id", teamIds);

  return count ?? 0;
}
