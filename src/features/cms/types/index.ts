// CMS table types for Supabase (ids may be uuid string or number)
type IdType = string | number

export type SiteSection = {
  id: IdType
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

export type Service = {
  id: IdType
  title: string | null
  description: string | null
  icon: string | null
  status?: string | null
  is_active?: boolean
  sort_order?: number | null
  display_order?: number | null
  created_at?: string | null
}

export type TeamMember = {
  id: IdType
  name: string | null
  role: string | null
  bio: string | null
  phone: string | null
  email: string | null
  image_url: string | null
  experience?: string | null
  experience_years?: number | null
  sort_order?: number | null
  created_at?: string | null
}

export type Testimonial = {
  id: IdType
  client_name: string | null
  client_role?: string | null
  content?: string | null
  review?: string | null
  rating: number | null
  image_url?: string | null
  client_image?: string | null
  is_active: boolean
  created_at?: string | null
}

export type Faq = {
  id: IdType
  question: string | null
  answer: string | null
  sort_order?: number | null
  display_order?: number | null
  is_active: boolean
  created_at?: string | null
}

export type CompanyStat = {
  id: IdType
  label: string | null
  value: string | null
  suffix?: string | null
  icon: string | null
  sort_order?: number | null
  display_order?: number | null
  created_at?: string | null
}

export type CompanyInfo = {
  id: IdType
  company_name?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  google_map_embed?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  linkedin_url?: string | null
  created_at?: string | null
}

export type LegalPage = {
  id: IdType
  slug?: string
  page_key?: string
  title: string | null
  content: string | null
  updated_at?: string | null
  created_at?: string | null
}

export type ContactInquiry = {
  id: IdType
  name: string | null
  email: string | null
  phone: string | null
  subject: string | null
  message: string | null
  status: string | null
  created_at?: string | null
}

export type HeroSection = {
  id: IdType
  title: string | null
  sub_title: string | null
  file_url: string | null
  media_type: string | null
  logo_url: string | null
  created_at?: string | null
}
