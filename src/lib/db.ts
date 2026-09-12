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
 *
 * El cliente se crea de forma perezosa (al primer uso real), no al
 * cargar el módulo. Next.js evalúa los módulos durante "Collect page
 * data" en el build, y si las variables de entorno no están disponibles
 * en ese momento (por ejemplo, un problema de configuración en Vercel),
 * crear el cliente de forma inmediata tumbaba TODA la build con
 * "supabaseUrl is required" — incluso para páginas que no llegan a
 * ejecutar ninguna consulta. Con la creación perezosa, ese error solo
 * ocurre si de verdad se intenta usar la base de datos sin las
 * variables configuradas, con un mensaje claro de qué falta.
 */
function createDbClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    {
      db: { schema: 'trd' },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  )
}

type DbClient = ReturnType<typeof createDbClient>

let client: DbClient | null = null

function getClient(): DbClient {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). ' +
        'Revisa Project Settings → Environment Variables en Vercel.'
    )
  }

  client = createDbClient()
  return client
}

/**
 * Proxy que se comporta exactamente como el cliente de Supabase
 * (db.from(...), db.rpc(...), db.auth.admin...), pero solo lo crea de
 * verdad la primera vez que se accede a una propiedad suya.
 */
export const db: DbClient = new Proxy({} as DbClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient() as object, prop, receiver)
  },
})
