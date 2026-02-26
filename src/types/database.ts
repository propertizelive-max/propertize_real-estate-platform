export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProfileRole = 'admin' | 'user'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: ProfileRole }
        Insert: { id: string; role?: ProfileRole }
        Update: { id?: string; role?: ProfileRole }
      }
      property_type: {
        // Supabase table: "Property_Types"
        // Columns: id, created_at, name, description (non-null)
        Row: { id: number; name: string; description: string }
        Insert: { id?: number; name: string; description: string }
        Update: { id?: number; name?: string; description?: string }
      }
      property_location: {
        // Supabase table: "Property_location"
        // Columns: id, created_at, streetaddress, city, state, zip_code
        Row: { id: number; streetaddress: string; city: string; state: string; zip_code: string }
        Insert: { id?: number; streetaddress: string; city: string; state: string; zip_code: string }
        Update: { id?: number; streetaddress?: string; city?: string; state?: string; zip_code?: string }
      }
      properties: {
        Row: { id: number; title: string; description: string | null; price: number | null; location_id: number | null; type_id: number | null }
        Insert: { id?: number; title: string; description?: string | null; price?: number | null; location_id?: number | null; type_id?: number | null }
        Update: { id?: number; title?: string; description?: string | null; price?: number | null; location_id?: number | null; type_id?: number | null }
      }
      property_media: {
        // Supabase table: "Propertys_media"
        // Columns: id, created_at, property_id, file_url
        Row: { id: number; property_id: number; file_url: string }
        Insert: { id?: number; property_id: number; file_url: string }
        Update: { id?: number; property_id?: number; file_url?: string }
      }
      amenities: {
        Row: { id: number; name: string }
        Insert: { id?: number; name: string }
        Update: { id?: number; name?: string }
      }
      property_amenities: {
        Row: { property_id: number; amenity_id: number }
        Insert: { property_id: number; amenity_id: number }
        Update: { property_id?: number; amenity_id?: number }
      }
      property_units: {
        Row: { id: number; property_id: number; unit_number: string | null; floor: number | null; bedrooms: number | null; bathrooms: number | null; square_feet: number | null; price: number | null; status: string | null }
        Insert: { id?: number; property_id: number; unit_number?: string | null; floor?: number | null; bedrooms?: number | null; bathrooms?: number | null; square_feet?: number | null; price?: number | null; status?: string | null }
        Update: { id?: number; property_id?: number; unit_number?: string | null; floor?: number | null; bedrooms?: number | null; bathrooms?: number | null; square_feet?: number | null; price?: number | null; status?: string | null }
      }
      appointments: {
        Row: { id: number; property_id: number; user_id: string; appointment_date: string }
        Insert: { id?: number; property_id: number; user_id: string; appointment_date: string }
        Update: { id?: number; property_id?: number; user_id?: string; appointment_date?: string }
      }
    }
  }
}

// Convenience types (table names may be cased in DB as Property_Types, Propertys, etc.)
export type Profile = Database['public']['Tables']['profiles']['Row']
export type PropertyType = Database['public']['Tables']['property_type']['Row']
export type PropertyLocation = Database['public']['Tables']['property_location']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type PropertyMedia = Database['public']['Tables']['property_media']['Row']
export type Amenity = Database['public']['Tables']['amenities']['Row']
export type PropertyAmenity = Database['public']['Tables']['property_amenities']['Row']
export type PropertyUnit = Database['public']['Tables']['property_units']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
