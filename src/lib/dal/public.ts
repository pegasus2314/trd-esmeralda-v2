import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

const EVENT_SLUG = process.env.NEXT_PUBLIC_EVENT_SLUG!;

export type PublicEvent = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "open" | "closed" | "archived";
  eventDate: string | null;
  venue: string | null;
};

/**
 * El evento activo. Memoizado por request: varias páginas/DAL calls lo
 * necesitan y no tiene sentido repetir la consulta.
 */
export const getCurrentEvent = cache(async (): Promise<PublicEvent | null> => {
  const { data, error } = await db
    .from("events")
    .select("id, name, slug, status, event_date, venue")
    .eq("slug", EVENT_SLUG)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    status: data.status,
    eventDate: data.event_date,
    venue: data.venue,
  };
});

export type PublicTeam = {
  id: string;
  teamName: string;
  schoolName: string;
  district: string | null;
};

/** Solo equipos con status "approved" — esta es información pública. */
export async function getApprovedTeams(): Promise<PublicTeam[]> {
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("teams")
    .select("id, team_name, school_name, district")
    .eq("event_id", event.id)
    .eq("status", "approved")
    .order("team_name");

  if (error || !data) return [];

  return data.map((t) => ({
    id: t.id,
    teamName: t.team_name,
    schoolName: t.school_name,
    district: t.district,
  }));
}

export type PublicDebater = {
  id: string;
  fullName: string;
  teamId: string;
  teamName: string;
};

/**
 * Debatientes de equipos aprobados, solo nombre — sin ningún dato de
 * contacto ni PII. Usado en la vista pública de Participantes.
 */
export async function getApprovedDebaters(): Promise<PublicDebater[]> {
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("debaters")
    .select("id, first_name, last_name, team_id, teams!inner(id, team_name, status, event_id)")
    .eq("teams.event_id", event.id)
    .eq("teams.status", "approved");

  if (error || !data) return [];

  return data.map((d) => {
    const team = Array.isArray(d.teams) ? d.teams[0] : d.teams;
    return {
      id: d.id,
      fullName: `${d.first_name} ${d.last_name}`.trim(),
      teamId: d.team_id,
      teamName: team?.team_name ?? "",
    };
  });
}

export type PublicStats = {
  teamCount: number;
  debaterCount: number;
};

export async function getPublicStats(): Promise<PublicStats> {
  const event = await getCurrentEvent();
  if (!event) return { teamCount: 0, debaterCount: 0 };

  const { count: teamCount } = await db
    .from("teams")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("status", "approved");

  const approved = await getApprovedTeams();
  const teamIds = approved.map((t) => t.id);
  let debaterCount = 0;
  if (teamIds.length) {
    const { count } = await db
      .from("debaters")
      .select("id", { count: "exact", head: true })
      .in("team_id", teamIds);
    debaterCount = count ?? 0;
  }

  return { teamCount: teamCount ?? 0, debaterCount };
}

export type PublishedAnnouncement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export async function getPublishedAnnouncements(): Promise<PublishedAnnouncement[]> {
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("announcements")
    .select("id, title, content, created_at")
    .eq("event_id", event.id)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.created_at,
  }));
}
