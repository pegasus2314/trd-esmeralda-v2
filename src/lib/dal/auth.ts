import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'

export type StaffRole =
  | 'admin_maestro'
  | 'admin'
  | 'coordinador'
  | 'acreditacion'
  | 'logistica'
  | 'evaluador'

export type StaffUser = {
  id: string
  email: string
  role: StaffRole
  fullName: string | null
}

/**
 * Roles con acceso al panel administrativo general (equipos, rondas,
 * enfrentamientos, anuncios). "acreditacion", "logistica" y "evaluador"
 * tienen sus propias pantallas más acotadas — ver requireRole().
 */
export const ADMIN_PANEL_ROLES: StaffRole[] = ['admin_maestro', 'admin', 'coordinador']

/** Roles que pueden consultar el QR de un participante y acreditarlo. */
export const ACCREDITATION_ROLES: StaffRole[] = [
  'admin_maestro',
  'admin',
  'coordinador',
  'acreditacion',
  'logistica',
]

/**
 * Roles con acceso al Centro de Operaciones (flota, mapas, cronograma,
 * staff de sede, incidencias) — el día del evento. "logistica" cubre
 * tanto a "Coordinador de Flota" como a "Staff de Punto" del diseño
 * original: no se distinguen como roles separados porque ambos
 * necesitan los mismos permisos (actualizar buses, ver el mapa,
 * reportar incidencias), solo cambia a qué punto están asignados.
 */
export const OPS_ROLES: StaffRole[] = ['admin_maestro', 'admin', 'coordinador', 'logistica']

/**
 * Lee la sesión de Supabase Auth (cookie) y, si existe, su rol de staff.
 * `cache()` memoiza el resultado durante un mismo render — evita repetir
 * la consulta si varias partes del árbol llaman a esto en la misma request.
 *
 * Devuelve null si no hay sesión o si la cuenta no tiene un rol de staff
 * asignado (por ejemplo, alguien que se autenticó pero nunca fue dado de
 * alta en trd.staff_roles).
 */
export const getCurrentStaff = cache(async (): Promise<StaffUser | null> => {
  const supabase = await createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: staffRow, error } = await db
    .from('staff_roles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !staffRow) return null

  return {
    id: user.id,
    email: user.email ?? '',
    role: staffRow.role as StaffRole,
    fullName: staffRow.full_name,
  }
})

/**
 * Para usar al principio de cualquier Server Component, Server Action o
 * Route Handler que requiera un rol de staff específico. Redirige a
 * /acceso si no hay sesión, o lanza un error explícito si la sesión es
 * válida pero el rol no alcanza — nunca confía en que la UI ya ocultó el
 * botón correspondiente.
 */
export async function requireRole(allowed: StaffRole[]): Promise<StaffUser> {
  const staff = await getCurrentStaff()
  if (!staff) redirect('/acceso')
  if (!allowed.includes(staff.role)) {
    throw new Error(
      `Tu rol ("${staff.role}") no tiene permiso para esta acción.`
    )
  }
  return staff
}
