import { supabase } from '@/lib/supabase'
import { TABLE } from '@/lib/tableNames'
import type {
  SiteSection,
  Service,
  TeamMember,
  Testimonial,
  Faq,
  CompanyStat,
  CompanyInfo,
  LegalPage,
  HeroSection,
} from '../types'

// --- Site Sections ---
export async function fetchSiteSections(activeOnly = false) {
  let q = supabase.from(TABLE.site_sections).select('*').order('section_key')
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as SiteSection[]
}

export async function upsertSiteSection(row: Partial<SiteSection>) {
  const { data, error } = await supabase
    .from(TABLE.site_sections)
    .upsert(
      {
        ...row,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'section_key' }
    )
    .select()
    .single()
  if (error) throw error
  return data as SiteSection
}

export async function updateSiteSection(id: string | number, row: Partial<SiteSection>) {
  const { data, error } = await supabase
    .from(TABLE.site_sections)
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SiteSection
}

// --- Services --- (schema: is_active)
export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from(TABLE.services)
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Service[]
}

export async function createService(row: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase.from(TABLE.services).insert(row).select().single()
  if (error) throw error
  return data as Service
}

export async function updateService(id: string | number, row: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase
    .from(TABLE.services)
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export async function deleteService(id: string | number) {
  const { error } = await supabase.from(TABLE.services).delete().eq('id', id)
  if (error) throw error
}

// --- Team Members --- (schema: experience_years, is_active)
export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from(TABLE.team_members)
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as TeamMember[]
}

export async function createTeamMember(row: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from(TABLE.team_members)
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as TeamMember
}

export async function updateTeamMember(id: string | number, row: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from(TABLE.team_members)
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as TeamMember
}

export async function deleteTeamMember(id: string | number) {
  const { error } = await supabase.from(TABLE.team_members).delete().eq('id', id)
  if (error) throw error
}

// --- Testimonials --- (DB: client_name, client_image, review)
export async function fetchTestimonials(activeOnly = false): Promise<Testimonial[]> {
  let q = supabase.from(TABLE.testimonials).select('*').order('created_at', { ascending: false })
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return ((data ?? []) as Testimonial[]).map((t) => ({
    id: t.id,
    client_name: t.client_name ?? null,
    client_image: t.client_image ?? null,
    review: t.review ?? null,
    rating: t.rating ?? null,
    is_active: t.is_active ?? false,
    created_at: (t as { created_at?: string }).created_at ?? '',
  }))
}

export async function createTestimonial(row: Partial<Testimonial>) {
  const { data, error } = await supabase
    .from(TABLE.testimonials)
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as Testimonial
}

export async function updateTestimonial(id: string | number, row: Partial<Testimonial>) {
  const { data, error } = await supabase
    .from(TABLE.testimonials)
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Testimonial
}

export async function deleteTestimonial(id: string | number) {
  const { error } = await supabase.from(TABLE.testimonials).delete().eq('id', id)
  if (error) throw error
}

// --- FAQs --- (schema: display_order not sort_order)
export async function fetchFaqs(activeOnly = false) {
  let q = supabase
    .from(TABLE.faqs)
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Faq[]
}

export async function createFaq(row: Partial<Faq>) {
  const payload: Record<string, unknown> = { ...row }
  if ('sort_order' in row && row.sort_order != null) payload.display_order = row.sort_order
  delete payload.sort_order
  const { data, error } = await supabase
    .from(TABLE.faqs)
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Faq
}

export async function updateFaq(id: string | number, row: Partial<Faq>) {
  const payload: Record<string, unknown> = { ...row }
  if ('sort_order' in row) payload.display_order = row.sort_order
  delete payload.sort_order
  const { data, error } = await supabase
    .from(TABLE.faqs)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Faq
}

export async function deleteFaq(id: string | number) {
  const { error } = await supabase.from(TABLE.faqs).delete().eq('id', id)
  if (error) throw error
}

// --- Company Stats --- (schema: display_order not sort_order)
export async function fetchCompanyStats() {
  const { data, error } = await supabase
    .from(TABLE.company_stats)
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as CompanyStat[]
}

export async function createCompanyStat(row: Partial<CompanyStat>) {
  const payload: Record<string, unknown> = { ...row }
  if ('sort_order' in row && row.sort_order != null) payload.display_order = row.sort_order
  delete payload.sort_order
  const { data, error } = await supabase
    .from(TABLE.company_stats)
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as CompanyStat
}

export async function updateCompanyStat(id: string | number, row: Partial<CompanyStat>) {
  const payload: Record<string, unknown> = { ...row }
  if ('sort_order' in row) payload.display_order = row.sort_order
  delete payload.sort_order
  const { data, error } = await supabase
    .from(TABLE.company_stats)
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as CompanyStat
}

export async function deleteCompanyStat(id: string | number) {
  const { error } = await supabase.from(TABLE.company_stats).delete().eq('id', id)
  if (error) throw error
}

// --- Legal Pages --- (schema: page_key)
export async function fetchLegalPages(): Promise<LegalPage[]> {
  const { data, error } = await supabase.from(TABLE.legal_pages).select('*').order('page_key')
  if (error) throw error
  return (data ?? []) as LegalPage[]
}

export async function upsertLegalPage(row: Partial<LegalPage> & { slug?: string; page_key?: string }) {
  const key = row.page_key ?? row.slug ?? ''
  const { data, error } = await supabase
    .from(TABLE.legal_pages)
    .upsert(
      { ...row, page_key: key, updated_at: new Date().toISOString() },
      { onConflict: 'page_key' }
    )
    .select()
    .single()
  if (error) throw error
  return data as LegalPage
}

export async function updateLegalPage(id: string | number, row: Partial<LegalPage>) {
  const { data, error } = await supabase
    .from(TABLE.legal_pages)
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as LegalPage
}

// --- Contact Inquiries (read-only for admin, no CRUD from CMS) ---
export async function fetchContactInquiries() {
  const { data, error } = await supabase
    .from(TABLE.contact_inquiries)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? [])
}

// --- Company Info (for footer, contact, CMS) ---
export async function fetchCompanyInfo() {
  const { data, error } = await supabase
    .from(TABLE.company_info)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data ?? null) as CompanyInfo | null
}

export async function createCompanyInfo(row: Partial<CompanyInfo>) {
  const { data, error } = await supabase
    .from(TABLE.company_info)
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as CompanyInfo
}

export async function updateCompanyInfo(id: string | number, row: Partial<CompanyInfo>) {
  const { data, error } = await supabase
    .from(TABLE.company_info)
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as CompanyInfo
}

// Lightweight helper for user-facing footer
export async function fetchCompanyProfile() {
  return fetchCompanyInfo()
}

// --- Hero Section ---
export async function fetchHeroSections() {
  const { data, error } = await supabase
    .from(TABLE.hero_section)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as HeroSection[]
}

export async function fetchHeroSection() {
  const { data, error } = await supabase
    .from(TABLE.hero_section)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data ?? null) as HeroSection | null
}

export async function createHeroSection(row: Partial<HeroSection>) {
  const { data, error } = await supabase
    .from(TABLE.hero_section)
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data as HeroSection
}

export async function updateHeroSection(id: string | number, row: Partial<HeroSection>) {
  const { data, error } = await supabase
    .from(TABLE.hero_section)
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as HeroSection
}

export async function deleteHeroSection(id: string | number) {
  const { error } = await supabase.from(TABLE.hero_section).delete().eq('id', id)
  if (error) throw error
}
