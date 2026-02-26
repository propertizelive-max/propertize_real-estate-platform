/**
 * Supabase table names. Must match your database exactly.
 * Postgres lowercases unquoted identifiers; if you created with quotes (e.g. "Property_Types", "Propertys"),
 * use those exact strings here: property_type: 'Property_Types', properties: 'Propertys', etc.
 */
export const TABLE = {
  profiles: 'profiles',
  // NOTE: These must match your Supabase tables EXACTLY (including case) if you created them with quotes.
  // Based on your Supabase screenshots:
  // - Property types table is "Property_Types"
  // - Property locations table is "Property_location"
  // - Properties table is "Propertys"
  // - Properties media table is "Propertys_media"
  property_type: 'Property_Types',
  property_location: 'Property_location',
  properties: 'Propertys',
  property_media: 'Propertys_media',
  amenities: 'amenities',
  property_amenities: 'property_amenities',
  property_units: 'property_units',
  appointments: 'appointments',
  compression: 'compression',
  // CMS tables
  site_sections: 'site_sections',
  services: 'services',
  team_members: 'team_members',
  testimonials: 'testimonials',
  faqs: 'faqs',
  company_stats: 'company_stats',
  company_info: 'company_info',
  legal_pages: 'legal_pages',
  contact_inquiries: 'contact_inquiries',
  hero_section: 'Hero_Section',
} as const
