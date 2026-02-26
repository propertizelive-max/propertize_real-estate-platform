import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TABLE } from '@/lib/tableNames'

type CreatePropertyBody = {
  title: string
  description?: string | null
  propertyType: string
  listingType: string | null
  price?: string | null
  street: string
  city: string
  state: string
  zip: string
  bedrooms?: string
  bathrooms?: string
  sqft?: string
  yearBuilt?: string
  amenities?: string[]
  isProject: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePropertyBody
    const {
      title,
      description,
      propertyType,
      listingType,
      price,
      street,
      city,
      state,
      zip,
      bedrooms = '0',
      bathrooms = '0',
      sqft,
      yearBuilt = '2023',
      amenities = [],
      isProject,
    } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    }
    if (!propertyType) {
      return NextResponse.json({ error: 'Property type is required.' }, { status: 400 })
    }
    if (!street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
      return NextResponse.json({ error: 'All location fields (street, city, state, zip) are required.' }, { status: 400 })
    }
    if (!isProject && !price?.trim()) {
      return NextResponse.json({ error: 'Asking price is required for non-Project properties.' }, { status: 400 })
    }

    const supabase = await createClient()
    const typeId = Number(propertyType)

    const locationPayload = {
      streetaddress: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip_code: zip.trim(),
    }

    const { data: locationRow, error: locationError } = await supabase
      .from(TABLE.property_location)
      .insert(locationPayload)
      .select('id')
      .single()

    if (locationError) {
      return NextResponse.json({ error: locationError.message }, { status: 500 })
    }

    const locationId = locationRow?.id as number

    const insertPayload: Record<string, unknown> = {
      title: title.trim(),
      about_property: description?.trim() || null,
      property_Type_id: typeId,
      property_location_id: locationId,
      listing_type: listingType ?? null,
    }

    if (isProject) {
      ;(insertPayload as Record<string, unknown>).year_built = yearBuilt ? Number(yearBuilt) : null
    } else {
      ;(insertPayload as Record<string, unknown>).price = price ? Number(price) : null
      ;(insertPayload as Record<string, unknown>).Bedrooms = bedrooms ? Number(bedrooms) : null
      ;(insertPayload as Record<string, unknown>).Bathrooms = bathrooms ? Number(bathrooms) : null
      ;(insertPayload as Record<string, unknown>).square_feet = sqft ? Number(sqft) : null
      ;(insertPayload as Record<string, unknown>).year_built = yearBuilt ? Number(yearBuilt) : null
    }

    const { data: propertyRow, error: insertError } = await supabase
      .from(TABLE.properties)
      .insert(insertPayload)
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const propertyId = propertyRow?.id as number

    if (propertyId && amenities.length > 0) {
      const rows = amenities.map((amenityId) => ({
        property_id: propertyId,
        amenity_id: Number(amenityId),
      }))
      const { error: pivotError } = await supabase.from(TABLE.property_amenities).insert(rows)
      if (pivotError) {
        return NextResponse.json({ error: pivotError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, propertyId })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create property'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
