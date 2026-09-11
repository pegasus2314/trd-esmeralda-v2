"use server";

import { revalidatePath } from "next/cache";
import { verifyDebater } from "@/lib/dal/accreditation";
import type { ActionResult } from "@/lib/actions/admin-actions";

export async function verifyDebaterAction(debaterId: string): Promise<ActionResult> {
  const result = await verifyDebater(debaterId);
  revalidatePath(`/admin/acreditar/${debaterId}`);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}
