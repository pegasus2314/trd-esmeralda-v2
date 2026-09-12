"use server";

import { revalidatePath } from "next/cache";
import {
  createVenue,
  deleteVenue,
  createPoint,
  deletePoint,
  addAssignment,
  deleteAssignment,
  createBus,
  deleteBus,
  cycleBusStatus,
  createScheduleItem,
  deleteScheduleItem,
  createIncident,
  resolveIncident,
} from "@/lib/dal/operations";
import type { ActionResult } from "@/lib/actions/admin-actions";

function wrap(fn: () => Promise<void>): Promise<ActionResult> {
  return fn()
    .then(() => ({ ok: true as const }))
    .catch((e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : "Error desconocido." }));
}

const REVALIDATE_PATHS = ["/admin/operaciones", "/admin/operaciones/mapas", "/admin/operaciones/staff"];

export async function createVenueAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() => createVenue(String(formData.get("name") ?? "")));
  revalidatePath("/admin/operaciones/mapas");
  return result;
}

export async function deleteVenueAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => deleteVenue(id));
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  return result;
}

export async function createPointAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createPoint({
      venueId: String(formData.get("venueId") ?? ""),
      code: String(formData.get("code") ?? ""),
      name: String(formData.get("name") ?? ""),
      type: String(formData.get("type") ?? "room"),
      x: Number(formData.get("x") ?? 20),
      y: Number(formData.get("y") ?? 20),
      w: Number(formData.get("w") ?? 100),
      h: Number(formData.get("h") ?? 60),
    })
  );
  revalidatePath("/admin/operaciones/mapas");
  return result;
}

export async function deletePointAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => deletePoint(id));
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  return result;
}

export async function addAssignmentAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    addAssignment({
      pointId: String(formData.get("pointId") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      groupLabel: String(formData.get("groupLabel") ?? "") || null,
      note: String(formData.get("note") ?? "") || null,
    })
  );
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  return result;
}

export async function deleteAssignmentAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => deleteAssignment(id));
  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
  return result;
}

export async function createBusAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createBus({
      code: String(formData.get("code") ?? ""),
      route: String(formData.get("route") ?? ""),
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      scheduledArrival: formData.get("scheduledArrival")
        ? new Date(String(formData.get("scheduledArrival"))).toISOString()
        : null,
    })
  );
  revalidatePath("/admin/operaciones/flota");
  revalidatePath("/admin/operaciones");
  return result;
}

export async function deleteBusAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => deleteBus(id));
  revalidatePath("/admin/operaciones/flota");
  revalidatePath("/admin/operaciones");
  return result;
}

export async function cycleBusStatusAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => cycleBusStatus(id));
  revalidatePath("/admin/operaciones/flota");
  revalidatePath("/admin/operaciones");
  return result;
}

export async function createScheduleItemAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createScheduleItem({
      scheduledAt: new Date(String(formData.get("scheduledAt") ?? "")).toISOString(),
      description: String(formData.get("description") ?? ""),
    })
  );
  revalidatePath("/admin/operaciones/cronograma");
  revalidatePath("/admin/operaciones");
  return result;
}

export async function deleteScheduleItemAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => deleteScheduleItem(id));
  revalidatePath("/admin/operaciones/cronograma");
  revalidatePath("/admin/operaciones");
  return result;
}

export async function createIncidentAction(formData: FormData): Promise<ActionResult> {
  const result = await wrap(() =>
    createIncident({
      locationLabel: String(formData.get("locationLabel") ?? ""),
      description: String(formData.get("description") ?? ""),
    })
  );
  revalidatePath("/admin/operaciones/incidencias");
  revalidatePath("/admin/operaciones");
  return result;
}

export async function resolveIncidentAction(id: string): Promise<ActionResult> {
  const result = await wrap(() => resolveIncident(id));
  revalidatePath("/admin/operaciones/incidencias");
  revalidatePath("/admin/operaciones");
  return result;
}
