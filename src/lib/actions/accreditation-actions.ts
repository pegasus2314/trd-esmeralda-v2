"use server";

import { revalidatePath } from "next/cache";
import { verifyDebaterByToken } from "@/lib/dal/accreditation";
import { resendAccreditationEmail, regenerateAccreditationToken } from "@/lib/dal/qr-delivery";
import type { ActionResult } from "@/lib/actions/admin-actions";

export async function verifyDebaterAction(token: string): Promise<ActionResult> {
  const result = await verifyDebaterByToken(token);
  revalidatePath(`/admin/acreditar/${token}`);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function resendQrAction(debaterId: string, teamId: string): Promise<ActionResult> {
  const result = await resendAccreditationEmail(debaterId);
  revalidatePath(`/admin/equipos/${teamId}`);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function regenerateQrAction(debaterId: string, teamId: string): Promise<ActionResult> {
  const result = await regenerateAccreditationToken(debaterId);
  revalidatePath(`/admin/equipos/${teamId}`);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}
