export type SiteSectionKey =
  | 'about_company'
  | 'company_vision'
  | 'company_mission'

/* ===============================
   Site Sections
================================= */
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
  created_at: string
  updated_at: string
}

/* ===============================
   Services
================================= */
export interface Service {
  id: number
  title: string | null
  description: string | null
  icon: string | null
  is_active: boolean
  created_at: string
}

/* ===============================
   Team Members
================================= */
export interface TeamMember {
  id: number
  name: string | null
  role: string | null
  bio: string | null
  phone: string | null
  email: string | null
  image_url: string | null
  experience_years: number | null
  is_active: boolean
  created_at: string
}

/* ===============================
   Testimonials
================================= */
export interface Testimonial {
  id: number
  client_name: string | null
  client_image: string | null
  review: string | null
  rating: number | null
  is_active: boolean
  created_at: string
}

/* ===============================
   FAQs
================================= */
export interface FAQ {
  id: number
  question: string | null
  answer: string | null
  display_order: number | null
  is_active: boolean
  created_at: string
}

export type Faq = FAQ

/* ===============================
   Company Stats
================================= */
export interface CompanyStat {
  id: number
  label: string | null
  value: string | null
  suffix?: string | null
  icon?: string | null
  sort_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

/* ===============================
   Company Info
================================= */
export interface CompanyInfo {
  id: number
  company_name: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  email: string | null
  google_map_embed: string | null
  facebook_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  created_at: string
}

/* ===============================
   Legal Pages
================================= */
export interface LegalPage {
  id: number
  page_key: string
  title: string | null
  content: string | null
  updated_at: string
}

/* ===============================
   Contact Inquiries
================================= */
export interface ContactInquiry {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  message: string | null
  created_at: string
}

/* ===============================
   Hero Section
================================= */
export interface HeroSection {
  id: number
  created_at: string
  file_url: string | null
  media_type: string | null
  title: string | null
  sub_title: string | null
  logo_url: string | null
}