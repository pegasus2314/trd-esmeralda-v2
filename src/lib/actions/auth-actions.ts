"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export type LoginState = { error: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Credenciales no válidas." };
  }

  // La sesión ya quedó creada en la cookie. Pero solo es "staff" de este
  // sistema si tiene una fila en trd.staff_roles — si no, cerramos la
  // sesión de inmediato para no dejar una cookie de Auth "colgada" sin
  // ningún permiso real en la aplicación.
  const { data: staffRow } = await db
    .from("staff_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!staffRow) {
    await supabase.auth.signOut();
    return { error: "Esta cuenta no tiene permisos administrativos en el TRD." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/acceso");
}
