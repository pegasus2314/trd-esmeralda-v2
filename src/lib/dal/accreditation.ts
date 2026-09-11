import "server-only";
import { db } from "@/lib/db";
import { requireRole, ACCREDITATION_ROLES } from "@/lib/dal/auth";

export type AccreditationFicha = {
  id: string;
  fullName: string;
  role: string;
  teamName: string;
  schoolName: string;
  district: string | null;
  email: string | null;
  phone: string | null;
  grade: string | null;
  accreditationStatus: "pending" | "accredited" | "rejected";
};

/**
 * Ficha completa (con PII) de un debatiente, para el personal que escanea
 * su QR. Requiere uno de los roles con permiso de acreditación — este
 * chequeo se repite aquí, no solo en la página, porque esta función podría
 * ser llamada desde otro lugar en el futuro y nunca debe asumir que ya se
 * verificó el permiso antes.
 */
export async function getDebaterForAccreditation(
  debaterId: string
): Promise<AccreditationFicha | null> {
  await requireRole(ACCREDITATION_ROLES);

  const { data, error } = await db
    .from("debaters")
    .select(
      "id, first_name, last_name, role, email, phone, grade, accreditation_status, teams(team_name, school_name, district)"
    )
    .eq("id", debaterId)
    .maybeSingle();

  if (error || !data) return null;
  const team = Array.isArray(data.teams) ? data.teams[0] : data.teams;

  return {
    id: data.id,
    fullName: `${data.first_name} ${data.last_name}`.trim(),
    role: data.role,
    teamName: team?.team_name ?? "—",
    schoolName: team?.school_name ?? "—",
    district: team?.district ?? null,
    email: data.email,
    phone: data.phone,
    grade: data.grade,
    accreditationStatus: data.accreditation_status,
  };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Marca a un debatiente como acreditado. El UPDATE incluye
 * `.neq('accreditation_status', 'accredited')` — una sola sentencia
 * atómica en Postgres — así que si dos miembros del staff escanean el
 * mismo QR casi al mismo tiempo, solo el primero consigue la fila
 * (0 filas afectadas para el segundo), sin condición de carrera posible.
 */
export async function verifyDebater(debaterId: string): Promise<VerifyResult> {
  const staff = await requireRole(ACCREDITATION_ROLES);

  const { data: current } = await db
    .from("debaters")
    .select("accreditation_status")
    .eq("id", debaterId)
    .maybeSingle();

  if (!current) return { ok: false, error: "Participante no encontrado." };
  if (current.accreditation_status === "accredited") {
    return { ok: false, error: "Este participante ya fue acreditado previamente." };
  }

  const now = new Date().toISOString();
  const { data: updated, error } = await db
    .from("debaters")
    .update({
      accreditation_status: "accredited",
      accreditation_verified_at: now,
      accreditation_verified_by: staff.id,
    })
    .eq("id", debaterId)
    .neq("accreditation_status", "accredited")
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!updated) {
    return { ok: false, error: "Este participante ya fue acreditado (por otra persona hace un instante)." };
  }

  await db.from("accreditation_log").insert({
    debater_id: debaterId,
    action: "accredited",
    verified_by: staff.id,
    verified_at: now,
  });

  return { ok: true };
}
