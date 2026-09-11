import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con la SERVICE ROLE KEY, apuntado al schema "trd" (aislado de
 * "public", que en este proyecto de Supabase contiene datos de otras
 * apps sin relación con el TRD). Bypasea RLS por diseño: la autorización
 * real vive en la Data Access Layer (src/lib/dal/*), nunca en el cliente.
 *
 * `import 'server-only'` hace que el build falle si este archivo se
 * importa por error desde un Client Component — la service role key
 * jamás debe llegar al navegador.
 */
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: { schema: 'trd' },
    auth: { persistSession: false, autoRefreshToken: false },
  }
)
