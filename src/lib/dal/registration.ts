import "server-only";
import { db } from "@/lib/db";
import { getCurrentEvent } from "@/lib/dal/public";
import { RegistrationSchema, type RegistrationInput } from "@/lib/validation";
import { sendInitialAccreditationEmails } from "@/lib/dal/qr-delivery";

export type CreateRegistrationResult =
  | { ok: true; emailsSent: number; emailsFailed: number }
  | { ok: false; error: string };

/**
 * Inserción pública de un equipo nuevo. Nadie autenticado necesita estar
 * aquí. El status siempre se fuerza a "pending" y accreditation_status
 * de cada debatiente siempre queda en su default: nunca llega desde el
 * cliente, a diferencia del sistema viejo donde un POST manipulado podía
 * autoasignarse "accredited" desde el registro.
 *
 * El equipo + coach + debatientes + registro se insertan en UNA sola
 * transacción vía trd.create_team_registration() (ver migración
 * create_team_registration_atomic_rpc). Antes se hacían 4 inserts
 * separados desde el cliente: una prueba real mostró que si el segundo
 * paso fallaba (timeout de red), el equipo del primer paso quedaba
 * "huérfano" en la base de datos, sin coach ni participantes. Con la
 * función atómica, cualquier falla revierte todo — nunca queda un
 * registro a medias.
 */
export async function createRegistration(
  input: RegistrationInput,
  origin: string
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

  const { data: teamId, error: rpcError } = await db.rpc("create_team_registration", {
    payload: {
      event_slug: event.slug,
      team_name: data.teamName,
      school_name: data.schoolName,
      district: data.district || null,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone || null,
      coach_name: data.coachName,
      coach_email: data.coachEmail,
      coach_phone: data.coachPhone,
      coach_id_number: data.coachIdNumber,
      coach_subject_area: data.coachSubjectArea,
      coach_school: data.coachSchool,
      coach_district: data.coachDistrict || data.district || null,
      debaters: data.debaters.map((d) => ({
        first_name: d.firstName,
        last_name: d.lastName,
        grade: d.grade,
        email: d.email || null,
        phone: d.phone,
        id_number: d.idNumber,
        allergies: d.allergies || null,
        medications: d.medications || null,
        role: d.role,
      })),
    },
  });

  if (rpcError) {
    if (rpcError.message.includes("EVENT_NOT_OPEN")) {
      return { ok: false, error: "Las inscripciones no están abiertas en este momento." };
    }
    if (rpcError.message.includes("DEBATER_COUNT_OUT_OF_RANGE")) {
      return { ok: false, error: "Cada equipo debe tener entre 3 y 5 debatientes." };
    }
    return { ok: false, error: "No se pudo registrar el equipo: " + rpcError.message };
  }
  if (!teamId) {
    return { ok: false, error: "No se pudo registrar el equipo." };
  }

  // El correo con el QR se manda apenas queda registrado, tal como se
  // especificó — la acreditación real (verificar + cambiar de estado)
  // sigue ocurriendo únicamente el día del evento, cuando el staff
  // escanea el QR. Un correo que falle no revierte la inscripción; ya
  // quedó guardada de forma atómica, y el participante puede pedir un
  // reenvío después desde el panel.
  const { data: insertedDebaters } = await db.from("debaters").select("id").eq("team_id", teamId as string);
  const debaterIds = (insertedDebaters ?? []).map((d) => d.id);
  const { sent, failed } = await sendInitialAccreditationEmails(debaterIds, origin);

  return { ok: true, emailsSent: sent, emailsFailed: failed };
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
