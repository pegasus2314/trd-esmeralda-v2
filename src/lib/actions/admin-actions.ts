"use server";

import { revalidatePath } from "next/cache";
import {
  setTeamStatus,
  deleteTeam,
  deleteDebater,
  createRound,
  deleteRound,
  createMatch,
  deleteMatch,
  createAnnouncement,
  deleteAnnouncement,
  setEventStatus,
  inviteStaff,
  removeStaff,
} from "@/lib/dal/admin";
import type { StaffRole } from "@/lib/dal/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

function wrap(fn: () => Promise<void>): Promise<ActionResult> {
  return fn()
    .then(() => ({ ok: true as const }))
    .catch((e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : "Error desconocido." }));
}

export async function approveTeamAction(teamId: string): Promise<ActionResult> {
  const result = await wrap(() => setTeamStatus(teamId, "approved"));
  revalidatePath("/admin/equipos");
  revalidatePath("/participantes");
  return result;
}

export async function rejectTeamAction(teamId: string): Promise<ActionResult> {
  const result = await wrap(() => setTeamStatus(teamId, "rejected"));
  revalidatePath("/admin/equipos");
  return result;
}

export async function deleteTeamAction(teamId: string): Promise<ActionResult> {
  const result = await wrap(() => deleteTeam(teamId));
  revalidatePath("/admin/equipos");
  revalidatePath("/participantes");
  return result;
}

export async function deleteDebaterAction(debaterId: string, teamId: string): Promise<ActionResult> {
  const result = await wrap(() => deleteDebater(debaterId));
  revalidatePath(`/admin/equipos/${teamId}`);
  return result;
}

export async function createRoundAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createRound({
      roundNumber: Number(formData.get("roundNumber")),
      name: String(formData.get("name") ?? ""),
      scheduledAt: formData.get("scheduledAt") ? new Date(String(formData.get("scheduledAt"))).toISOString() : null,
    })
  );
  revalidatePath("/admin/rondas");
  return result;
}

export async function deleteRoundAction(roundId: string): Promise<ActionResult> {
  const result = await wrap(() => deleteRound(roundId));
  revalidatePath("/admin/rondas");
  return result;
}

export async function createMatchAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createMatch({
      roundId: String(formData.get("roundId")),
      teamAId: String(formData.get("teamAId")),
      teamBId: String(formData.get("teamBId")),
      room: String(formData.get("room") ?? "") || null,
    })
  );
  revalidatePath("/admin/enfrentamientos");
  return result;
}

export async function deleteMatchAction(matchId: string): Promise<ActionResult> {
  const result = await wrap(() => deleteMatch(matchId));
  revalidatePath("/admin/enfrentamientos");
  return result;
}

export async function createAnnouncementAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createAnnouncement({
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      published: formData.get("published") === "true",
    })
  );
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
  return result;
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => deleteAnnouncement(id));
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
  return result;
}

export async function setEventStatusAction(status: "draft" | "open" | "closed" | "archived"): Promise<ActionResult> {
  const result = await wrap(() => setEventStatus(status));
  revalidatePath("/admin");
  revalidatePath("/inscripcion");
  return result;
}

export async function inviteStaffAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    inviteStaff(
      String(formData.get("email") ?? ""),
      String(formData.get("role") ?? "") as StaffRole,
      String(formData.get("fullName") ?? "")
    )
  );
  revalidatePath("/admin/staff");
  return result;
}

export async function removeStaffAction(userId: string): Promise<ActionResult> {
  const result = await wrap(() => removeStaff(userId));
  revalidatePath("/admin/staff");
  return result;
}
