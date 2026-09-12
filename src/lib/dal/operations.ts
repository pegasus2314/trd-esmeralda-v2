import "server-only";
import { db } from "@/lib/db";
import { requireRole, OPS_ROLES } from "@/lib/dal/auth";
import { getCurrentEvent } from "@/lib/dal/public";

// ---------- Mapas: sedes, puntos y asignaciones ----------

export type OpsAssignment = { id: string; displayName: string; groupLabel: string | null; note: string | null };
export type OpsPoint = {
  id: string;
  code: string;
  name: string;
  type: "entry" | "corridor" | "room" | "service";
  x: number;
  y: number;
  w: number;
  h: number;
  assignments: OpsAssignment[];
};
export type OpsVenue = { id: string; name: string; points: OpsPoint[] };

export async function listVenues(): Promise<OpsVenue[]> {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data: venues } = await db
    .from("ops_venues")
    .select("id, name")
    .eq("event_id", event.id)
    .order("order_index");
  if (!venues || venues.length === 0) return [];

  const venueIds = venues.map((v) => v.id);
  const { data: points } = await db
    .from("ops_points")
    .select("id, venue_id, code, name, point_type, pos_x, pos_y, width, height")
    .in("venue_id", venueIds)
    .order("order_index");
  const pointIds = (points ?? []).map((p) => p.id);

  const { data: assignments } = pointIds.length
    ? await db
        .from("ops_assignments")
        .select("id, point_id, display_name, group_label, note")
        .in("point_id", pointIds)
        .order("created_at")
    : { data: [] as never[] };

  const assignmentsByPoint = new Map<string, OpsAssignment[]>();
  for (const a of assignments ?? []) {
    const list = assignmentsByPoint.get(a.point_id) ?? [];
    list.push({ id: a.id, displayName: a.display_name, groupLabel: a.group_label, note: a.note });
    assignmentsByPoint.set(a.point_id, list);
  }

  const pointsByVenue = new Map<string, OpsPoint[]>();
  for (const p of points ?? []) {
    const list = pointsByVenue.get(p.venue_id) ?? [];
    list.push({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.point_type,
      x: Number(p.pos_x),
      y: Number(p.pos_y),
      w: Number(p.width),
      h: Number(p.height),
      assignments: assignmentsByPoint.get(p.id) ?? [],
    });
    pointsByVenue.set(p.venue_id, list);
  }

  return venues.map((v) => ({ id: v.id, name: v.name, points: pointsByVenue.get(v.id) ?? [] }));
}

export async function createVenue(name: string) {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");
  const { error } = await db.from("ops_venues").insert({ event_id: event.id, name });
  if (error) throw new Error(error.message);
}

export async function deleteVenue(id: string) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_venues").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createPoint(input: {
  venueId: string;
  code: string;
  name: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_points").insert({
    venue_id: input.venueId,
    code: input.code,
    name: input.name,
    point_type: input.type,
    pos_x: input.x,
    pos_y: input.y,
    width: input.w,
    height: input.h,
  });
  if (error) throw new Error(error.message);
}

export async function deletePoint(id: string) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_points").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addAssignment(input: { pointId: string; displayName: string; groupLabel: string | null; note: string | null }) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_assignments").insert({
    point_id: input.pointId,
    display_name: input.displayName,
    group_label: input.groupLabel || null,
    note: input.note || null,
  });
  if (error) throw new Error(error.message);
}

export async function deleteAssignment(id: string) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_assignments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Directorio de staff: las mismas asignaciones de Mapas, agrupadas por group_label en vez de por punto. */
export async function listStaffDirectory(): Promise<{ group: string; people: { id: string; name: string; note: string | null; pointLabel: string }[] }[]> {
  const venues = await listVenues();
  const groups = new Map<string, { id: string; name: string; note: string | null; pointLabel: string }[]>();
  for (const venue of venues) {
    for (const point of venue.points) {
      for (const a of point.assignments) {
        const group = a.groupLabel || "Sin grupo asignado";
        const list = groups.get(group) ?? [];
        list.push({ id: a.id, name: a.displayName, note: a.note, pointLabel: `${venue.name} — ${point.code} ${point.name}` });
        groups.set(group, list);
      }
    }
  }
  return [...groups.entries()].map(([group, people]) => ({ group, people }));
}

// ---------- Flota ----------

export type OpsBus = {
  id: string;
  code: string;
  route: string;
  capacity: number | null;
  status: "base" | "route" | "arrived";
  scheduledArrival: string | null;
};

export async function listBuses(): Promise<OpsBus[]> {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("ops_buses")
    .select("id, code, route, capacity, status, scheduled_arrival")
    .eq("event_id", event.id)
    .order("scheduled_arrival", { ascending: true, nullsFirst: false })
    .order("code");
  if (error || !data) return [];
  return data.map((b) => ({
    id: b.id,
    code: b.code,
    route: b.route,
    capacity: b.capacity,
    status: b.status,
    scheduledArrival: b.scheduled_arrival,
  }));
}

export async function createBus(input: { code: string; route: string; capacity: number | null; scheduledArrival: string | null }) {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");
  const { error } = await db.from("ops_buses").insert({
    event_id: event.id,
    code: input.code,
    route: input.route,
    capacity: input.capacity,
    scheduled_arrival: input.scheduledArrival,
  });
  if (error) throw new Error(error.message);
}

export async function deleteBus(id: string) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_buses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function cycleBusStatus(id: string) {
  const staff = await requireRole(OPS_ROLES);
  const { data: bus } = await db.from("ops_buses").select("status").eq("id", id).maybeSingle();
  if (!bus) throw new Error("Autobús no encontrado.");
  const order = ["base", "route", "arrived"] as const;
  const next = order[(order.indexOf(bus.status as (typeof order)[number]) + 1) % order.length];
  const { error } = await db
    .from("ops_buses")
    .update({ status: next, updated_at: new Date().toISOString(), updated_by: staff.id })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Cronograma ----------

export type OpsScheduleItem = { id: string; scheduledAt: string; description: string };

export async function listScheduleItems(): Promise<OpsScheduleItem[]> {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("ops_schedule_items")
    .select("id, scheduled_at, description")
    .eq("event_id", event.id)
    .order("scheduled_at");
  if (error || !data) return [];
  return data.map((i) => ({ id: i.id, scheduledAt: i.scheduled_at, description: i.description }));
}

export async function createScheduleItem(input: { scheduledAt: string; description: string }) {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");
  const { error } = await db.from("ops_schedule_items").insert({
    event_id: event.id,
    scheduled_at: input.scheduledAt,
    description: input.description,
  });
  if (error) throw new Error(error.message);
}

export async function deleteScheduleItem(id: string) {
  await requireRole(OPS_ROLES);
  const { error } = await db.from("ops_schedule_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Incidencias ----------

export type OpsIncident = {
  id: string;
  reporterName: string;
  locationLabel: string;
  description: string;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
};

export async function listIncidents(): Promise<OpsIncident[]> {
  await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) return [];

  const { data, error } = await db
    .from("ops_incidents")
    .select("id, reporter_name, location_label, description, status, created_at, resolved_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((i) => ({
    id: i.id,
    reporterName: i.reporter_name,
    locationLabel: i.location_label,
    description: i.description,
    status: i.status,
    createdAt: i.created_at,
    resolvedAt: i.resolved_at,
  }));
}

export async function createIncident(input: { locationLabel: string; description: string }) {
  const staff = await requireRole(OPS_ROLES);
  const event = await getCurrentEvent();
  if (!event) throw new Error("No hay evento activo.");
  const { error } = await db.from("ops_incidents").insert({
    event_id: event.id,
    reported_by: staff.id,
    reporter_name: staff.fullName || staff.email,
    location_label: input.locationLabel,
    description: input.description,
  });
  if (error) throw new Error(error.message);
}

export async function resolveIncident(id: string) {
  await requireRole(OPS_ROLES);
  const { error } = await db
    .from("ops_incidents")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Resumen ----------

export async function getOpsOverview() {
  const [buses, incidents] = await Promise.all([listBuses(), listIncidents()]);
  const items = await listScheduleItems();
  const now = Date.now();
  const next = items.find((i) => new Date(i.scheduledAt).getTime() >= now) ?? null;

  return {
    busCounts: {
      base: buses.filter((b) => b.status === "base").length,
      route: buses.filter((b) => b.status === "route").length,
      arrived: buses.filter((b) => b.status === "arrived").length,
    },
    openIncidents: incidents.filter((i) => i.status === "open").length,
    nextItem: next,
  };
}
