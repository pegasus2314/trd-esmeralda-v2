import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente de Supabase para el SERVIDOR, usado exclusivamente para
 * autenticación (sesión de staff vía cookies). Usa la clave anon/publishable
 * — nunca la service role — porque solo habla con el servicio de Auth de
 * Supabase, no con las tablas de datos.
 *
 * El acceso a los datos del torneo (schema "trd") nunca pasa por este
 * cliente: vive en `src/lib/db.ts`, que usa la service role key y solo se
 * importa desde código server-only.
 */
export async function createAuthClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Se llama desde un Server Component (no una Server Action o
            // Route Handler). Es seguro ignorar: `proxy.ts` refresca la
            // sesión en cada request.
          }
        },
      },
    }
  )
}
