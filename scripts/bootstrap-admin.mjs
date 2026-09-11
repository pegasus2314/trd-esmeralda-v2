import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "trd" },
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error("Uso: node scripts/bootstrap-admin.mjs <email> <password>");
  process.exit(1);
}

const { data: created, error: createError } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (createError) {
  console.error("Error creando usuario:", createError.message);
  process.exit(1);
}

const { error: roleError } = await db.from("staff_roles").insert({
  user_id: created.user.id,
  role: "admin_maestro",
  full_name: "Administrador maestro",
});
if (roleError) {
  console.error("Error asignando rol:", roleError.message);
  process.exit(1);
}

console.log("Cuenta admin_maestro creada:", email);
