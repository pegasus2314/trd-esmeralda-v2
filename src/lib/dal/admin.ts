import "server-only";
import { db } from "@/lib/db";
import { requireRole, ADMIN_PANEL_ROLES, type StaffRole } from "@/lib/dal/auth";
import { getCurrentEvent } from "@/lib/dal/public";

export type TeamRow = {
  id: string;
  teamName: string;
  schoolName: string;
  district: string | null;
  status: "pending" | "approved" | "rejected" | "waitlist";
  createdAt: string;
};

export async function getOverview() {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) return { teams: [] as TeamRow[], debaterCount: 0 };

  const [{ data: teams }, { count: debaterCount }] = await Promise.all([
    db.from("teams").select("id, status").eq("event_id", event.id),
    db
      .from("debaters")
      .select("id, teams!inner(event_id)", { count: "exact", head: true })
      .eq("teams.event_id", event.id),
  ]);

  return {
    teams: (teams ?? []) as { id: string; status: TeamRow["status"] }[],
    debaterCount: debaterCount ?? 0,
  };
}

export async function listTeams(): Promise<TeamRow[]> {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("teams")
    .select("id, team_name, school_name, district, status, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((t) => ({
    id: t.id,
    teamName: t.team_name,
    schoolName: t.school_name,
    district: t.district,
    status: t.status,
    createdAt: t.created_at,
  }));
}

export type TeamDetail = {
  id: string;
  teamName: string;
  schoolName: string;
  district: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: TeamRow["status"];
  coach: { fullName: string; email: string; phone: string | null } | null;
  debaters: {
    id: string;
    fullName: string;
    role: string;
    email: string | null;
    accreditationStatus: string;
  }[];
};

export async function getTeamDetail(teamId: string): Promise<TeamDetail | null> {
  await requireRole(ADMIN_PANEL_ROLES);

  const [{ data: team }, { data: coach }, { data: debaters }] = await Promise.all([
    db.from("teams").select("*").eq("id", teamId).maybeSingle(),
    db.from("coaches").select("full_name, email, phone").eq("team_id", teamId).maybeSingle(),
    db
      .from("debaters")
      .select("id, first_name, last_name, role, email, accreditation_status")
      .eq("team_id", teamId)
      .order("created_at"),
  ]);

  if (!team) return null;

  return {
    id: team.id,
    teamName: team.team_name,
    schoolName: team.school_name,
    district: team.district,
    contactName: team.contact_name,
    contactEmail: team.contact_email,
    contactPhone: team.contact_phone,
    status: team.status,
    coach: coach ? { fullName: coach.full_name, email: coach.email, phone: coach.phone } : null,
    debaters: (debaters ?? []).map((d) => ({
      id: d.id,
      fullName: `${d.first_name} ${d.last_name}`.trim(),
      role: d.role,
      email: d.email,
      accreditationStatus: d.accreditation_status,
    })),
  };
}

export async function setTeamStatus(teamId: string, status: "approved" | "rejected") {
  await requireRole(ADMIN_PANEL_ROLES);

  const { error } = await db
    .from("teams")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", teamId);
  if (error) throw new Error(error.message);

  await db
    .from("registrations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("team_id", teamId);
}

export async function deleteTeam(teamId: string) {
  await requireRole(ADMIN_PANEL_ROLES);

  for (const table of ["debaters", "coaches", "registrations"] as const) {
    const { error } = await db.from(table).delete().eq("team_id", teamId);
    if (error) throw new Error(`No se pudo limpiar ${table}: ${error.message}`);
  }
  const { error } = await db.from("teams").delete().eq("id", teamId);
  if (error) throw new Error(error.message);
}

export async function deleteDebater(debaterId: string) {
  await requireRole(ADMIN_PANEL_ROLES);
  const { error } = await db.from("debaters").delete().eq("id", debaterId);
  if (error) throw new Error(error.message);
}

// ---------- Rondas ----------

export type RoundRow = {
  id: string;
  roundNumber: number;
  name: string;
  status: string;
  scheduledAt: string | null;
};

export async function listRounds(): Promise<RoundRow[]> {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data } = await db
    .from("rounds")
    .select("id, round_number, name, status, scheduled_at")
    .eq("event_id", event.id)
    .order("round_number");

  return (data ?? []).map((r) => ({
    id: r.id,
    roundNumber: r.round_number,
    name: r.name,
    status: r.status,
    scheduledAt: r.scheduled_at,
  }));
}

export async function createRound(input: { roundNumber: number; name: string; scheduledAt: string | null }) {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");

  const { error } = await db.from("rounds").insert({
    event_id: event.id,
    round_number: input.roundNumber,
    name: input.name,
    scheduled_at: input.scheduledAt,
  });
  if (error) throw new Error(error.message);
}

export async function deleteRound(roundId: string) {
  await requireRole(ADMIN_PANEL_ROLES);
  const { error } = await db.from("rounds").delete().eq("id", roundId);
  if (error) throw new Error(error.message);
}

// ---------- Enfrentamientos ----------

export type MatchRow = {
  id: string;
  roundName: string;
  teamAName: string | null;
  teamBName: string | null;
  room: string | null;
  status: string;
};

export async function listMatches(): Promise<MatchRow[]> {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data: rounds } = await db.from("rounds").select("id, name").eq("event_id", event.id);
  const roundIds = (rounds ?? []).map((r) => r.id);
  if (!roundIds.length) return [];

  const { data } = await db
    .from("matches")
    .select("id, room, status, round_id, team_a:teams!matches_team_a_id_fkey(team_name), team_b:teams!matches_team_b_id_fkey(team_name)")
    .in("round_id", roundIds)
    .order("created_at", { ascending: false });

  const roundMap = new Map((rounds ?? []).map((r) => [r.id, r.name]));

  return (data ?? []).map((m) => {
    const teamA = Array.isArray(m.team_a) ? m.team_a[0] : m.team_a;
    const teamB = Array.isArray(m.team_b) ? m.team_b[0] : m.team_b;
    return {
      id: m.id,
      roundName: roundMap.get(m.round_id) ?? "—",
      teamAName: teamA?.team_name ?? null,
      teamBName: teamB?.team_name ?? null,
      room: m.room,
      status: m.status,
    };
  });
}

export async function createMatch(input: { roundId: string; teamAId: string; teamBId: string; room: string | null }) {
  await requireRole(ADMIN_PANEL_ROLES);
  if (input.teamAId === input.teamBId) throw new Error("Los equipos deben ser diferentes.");

  const { error } = await db.from("matches").insert({
    round_id: input.roundId,
    team_a_id: input.teamAId,
    team_b_id: input.teamBId,
    room: input.room,
  });
  if (error) throw new Error(error.message);
}

export async function deleteMatch(matchId: string) {
  await requireRole(ADMIN_PANEL_ROLES);
  const { error } = await db.from("matches").delete().eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function listApprovedTeamsForMatches() {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];
  const { data } = await db
    .from("teams")
    .select("id, team_name")
    .eq("event_id", event.id)
    .eq("status", "approved")
    .order("team_name");
  return (data ?? []).map((t) => ({ id: t.id, teamName: t.team_name }));
}

// ---------- Anuncios ----------

export type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
};

export async function listAnnouncements(): Promise<AnnouncementRow[]> {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data } = await db
    .from("announcements")
    .select("id, title, content, published, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    published: a.published,
    createdAt: a.created_at,
  }));
}

export async function createAnnouncement(input: { title: string; content: string; published: boolean }) {
  await requireRole(ADMIN_PANEL_ROLES);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");

  const { error } = await db.from("announcements").insert({
    event_id: event.id,
    title: input.title,
    content: input.content,
    published: input.published,
  });
  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(id: string) {
  await requireRole(ADMIN_PANEL_ROLES);
  const { error } = await db.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Evento (abrir/cerrar inscripciones) ----------

export async function setEventStatus(status: "draft" | "open" | "closed" | "archived") {
  await requireRole(["admin_maestro", "admin"]);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");
  const { error } = await db
    .from("events")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", event.id);
  if (error) throw new Error(error.message);
}

// ---------- Staff (solo admin_maestro) ----------

export type StaffRow = { userId: string; email: string; role: StaffRole; fullName: string | null };

export async function listStaff(): Promise<StaffRow[]> {
  await requireRole(["admin_maestro"]);
  const { data, error } = await db.from("staff_roles").select("user_id, role, full_name");
  if (error || !data) return [];

  // auth.users no vive en el schema "trd"; se consulta vía Admin API.
  const results: StaffRow[] = [];
  for (const row of data) {
    const { data: userData } = await db.auth.admin.getUserById(row.user_id);
    results.push({
      userId: row.user_id,
      email: userData?.user?.email ?? "(desconocido)",
      role: row.role as StaffRole,
      fullName: row.full_name,
    });
  }
  return results;
}

export async function inviteStaff(email: string, role: StaffRole, fullName: string) {
  await requireRole(["admin_maestro"]);

  const { data: created, error: createError } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(), // temporal; el staff usa "olvidé mi contraseña" para fijar la suya
  });
  if (createError || !created.user) {
    throw new Error(createError?.message ?? "No se pudo crear la cuenta.");
  }

  const { error: roleError } = await db.from("staff_roles").insert({
    user_id: created.user.id,
    role,
    full_name: fullName || null,
  });
  if (roleError) throw new Error(roleError.message);

  const { error: resetError } = await db.auth.resetPasswordForEmail(email);
  if (resetError) console.error("reset password email", resetError);
}

export async function removeStaff(userId: string) {
  await requireRole(["admin_maestro"]);
  const { error } = await db.from("staff_roles").delete().eq("user_id", userId);
  if (error) throw new Error(error.message);
}
