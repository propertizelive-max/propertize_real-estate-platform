export type SiteSectionKey = 'about_company' | 'company_vision' | 'company_mission'

export interface SiteSection {
  id: number
  section_key: string
  title: string | null
  subtitle: string | null
  description: string | null
  image_url: string | null
  button_text: string | null
  button_link: string | null
  is_active: boolean
  created_at?: string | null
  updated_at?: string | null
}

export interface Service {
  id: number
  title: string | null
  description: string | null
  icon: string | null
  status: string | null
  sort_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface TeamMember {
  id: number
  name: string | null
  role: string | null
  bio: string | null
  phone: string | null
  email: string | null
  image_url: string | null
  experience?: string | null
  sort_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface Testimonial {
  id: number
  author_name: string | null
  author_role: string | null
  content: string | null
  rating?: number | null
  image_url?: string | null
  is_active?: boolean | null
  sort_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface FAQ {
  id: number
  question: string | null
  answer: string | null
  sort_order?: number | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CompanyStat {
  id: number
  label: string | null
  value: string | null
  icon?: string | null
  sort_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CompanyInfo {
  id: number
  key: string | null
  value: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface LegalPage {
  id: number
  slug: string | null
  title: string | null
  content: string | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}
