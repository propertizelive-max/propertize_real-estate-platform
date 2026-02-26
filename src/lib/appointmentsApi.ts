import { supabase } from './supabase'
import { TABLE } from './tableNames'

export type AppointmentWithDetails = {
  id: number
  property_id: number
  user_id: string
  appointment_date: string
  status?: string | null
  created_at?: string | null
  property_title: string | null
  property_image: string | null
  property_location: string | null
  client_name: string | null
  client_email: string | null
  client_phone: string | null
}

/** Create a new appointment (user must be logged in). Ensures profile exists and stores profile_id. */
export async function createAppointment(
  propertyId: number,
  userId: string,
  appointmentDate: string,
  options?: { fullName?: string | null; phone?: string | null; email?: string | null }
): Promise<{ id: number } | null> {
  const fullName = options?.fullName?.trim() || (options?.email ? options.email.split('@')[0] : null) || 'Guest'
  await supabase.from(TABLE.profiles).upsert(
    {
      id: userId,
      full_name: fullName,
      phone: options?.phone ?? null,
    },
    { onConflict: 'id' }
  )

  const payload: Record<string, unknown> = {
    property_id: propertyId,
    user_id: userId,
    profile_id: userId,
    appointment_date: appointmentDate,
  }
  const { data, error } = await supabase
    .from(TABLE.appointments)
    .insert(payload as { property_id: number; user_id: string; profile_id: string; appointment_date: string })
    .select('id')
    .single()

  if (error) throw error
  return data as { id: number } | null
}

/** Fetch all appointments for admin with property and profile details */
export async function fetchAppointments(): Promise<AppointmentWithDetails[]> {
  const { data: rows, error } = await supabase
    .from(TABLE.appointments)
    .select('id, property_id, user_id, profile_id, appointment_date, status, created_at')
    .order('appointment_date', { ascending: false })

  if (error) throw error
  if (!rows?.length) return []

  const propertyIds = [...new Set(rows.map((r: { property_id: number }) => r.property_id))]
  const profileIds = [...new Set(rows.flatMap((r: { profile_id?: string | null; user_id: string }) => [r.profile_id ?? r.user_id].filter(Boolean)))]

  const [propsRes, mediaRes, locRes, profilesRes] = await Promise.all([
    supabase.from(TABLE.properties).select('id, title, property_location_id').in('id', propertyIds),
    supabase.from(TABLE.property_media).select('property_id, file_url').in('property_id', propertyIds).order('id'),
    supabase.from(TABLE.property_location).select('id, streetaddress, city, state, zip_code'),
    profileIds.length > 0 ? supabase.from(TABLE.profiles).select('id, full_name, phone').in('id', profileIds) : { data: [] },
  ])

  const props = (propsRes.data ?? []) as { id: number; title: string | null; property_location_id: number | null }[]
  const mediaRows = mediaRes.data ?? []
  const locs = (locRes.data ?? []) as { id: number; streetaddress: string; city: string; state: string; zip_code: string }[]
  const profiles = (profilesRes.data ?? []) as { id: string; full_name: string | null; phone: string | null }[]

  const propMap: Record<number, { title: string | null; location: string }> = {}
  const mediaByProp: Record<number, string> = {}
  const locMap: Record<number, (typeof locs)[0]> = {}
  locs.forEach((l) => { locMap[l.id] = l })
  mediaRows.forEach((m: { property_id: number; file_url: string }) => {
    if (!mediaByProp[m.property_id]) mediaByProp[m.property_id] = m.file_url
  })
  props.forEach((p) => {
    const loc = p.property_location_id ? locMap[p.property_location_id] : null
    const locationStr = loc ? [loc.streetaddress, loc.city, loc.state, loc.zip_code].filter(Boolean).join(', ') : ''
    propMap[p.id] = { title: p.title, location: locationStr }
  })

  const profileMap: Record<string, { full_name: string | null; phone: string | null }> = {}
  profiles.forEach((p) => {
    profileMap[p.id] = { full_name: p.full_name, phone: p.phone }
  })

  return rows.map((r: { id: number; property_id: number; user_id: string; profile_id?: string | null; appointment_date: string; status?: string | null; created_at?: string | null }) => {
    const prop = propMap[r.property_id]
    const profileId = r.profile_id ?? r.user_id
    const profile = profileMap[profileId]
    return {
      id: r.id,
      property_id: r.property_id,
      user_id: r.user_id,
      appointment_date: r.appointment_date,
      status: r.status ?? 'pending',
      created_at: r.created_at,
      property_title: prop?.title ?? null,
      property_image: mediaByProp[r.property_id] ?? null,
      property_location: prop?.location ?? null,
      client_name: profile?.full_name ?? null,
      client_email: null,
      client_phone: profile?.phone ?? null,
    }
  })
}

/** Fetch a single appointment by ID with full details */
export async function fetchAppointmentById(id: number): Promise<AppointmentWithDetails | null> {
  const { data: row, error } = await supabase
    .from(TABLE.appointments)
    .select('id, property_id, user_id, profile_id, appointment_date, status, created_at')
    .eq('id', id)
    .single()

  if (error || !row) return null

  const r = row as { id: number; property_id: number; user_id: string; profile_id?: string | null; appointment_date: string; status?: string | null; created_at?: string | null }
  const profileId = r.profile_id ?? r.user_id

  const [propRes, mediaRes, profileRes] = await Promise.all([
    supabase.from(TABLE.properties).select('id, title, property_location_id').eq('id', r.property_id).single(),
    supabase.from(TABLE.property_media).select('property_id, file_url').eq('property_id', r.property_id).order('id').limit(5),
    supabase.from(TABLE.profiles).select('id, full_name, phone').eq('id', profileId).maybeSingle(),
  ])

  const prop = propRes.data as { id: number; title: string | null; property_location_id: number | null } | null
  let locationStr = ''
  if (prop?.property_location_id) {
    const { data: loc } = await supabase
      .from(TABLE.property_location)
      .select('streetaddress, city, state, zip_code')
      .eq('id', prop.property_location_id)
      .single()
    const locRow = loc as { streetaddress: string; city: string; state: string; zip_code: string } | null
    if (locRow) {
      locationStr = [locRow.streetaddress, locRow.city, locRow.state, locRow.zip_code].filter(Boolean).join(', ')
    }
  }

  const mediaRows = mediaRes.data ?? []
  const firstImage = mediaRows[0] as { file_url: string } | undefined
  const profile = profileRes.data as { full_name: string | null; phone: string | null } | null

  return {
    id: r.id,
    property_id: r.property_id,
    user_id: r.user_id,
    appointment_date: r.appointment_date,
    status: r.status ?? 'pending',
    created_at: r.created_at,
    property_title: prop?.title ?? null,
    property_image: firstImage?.file_url ?? null,
    property_location: locationStr || null,
    client_name: profile?.full_name ?? null,
    client_email: null,
    client_phone: profile?.phone ?? null,
  }
}
