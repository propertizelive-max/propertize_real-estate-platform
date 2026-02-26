import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { parsePropertyIdFromSlug } from '@/lib/slug'
import { fetchPropertyByIdServer, fetchSimilarPropertiesServer } from '@/lib/propertyApi.server'
import { getFirstImage, formatPrice, formatLocation } from '@/lib/propertyApi'
import PropertyDetailContent from '@/components/PropertyDetailContent'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = parsePropertyIdFromSlug(slug)
  if (!id) return { title: 'Property Not Found' }

  const property = await fetchPropertyByIdServer(id)
  if (!property) return { title: 'Property Not Found' }

  const title = property.title ?? 'Property'
  const description =
    property.about_property?.slice(0, 155) ??
    `${title} - ${formatPrice(property.price)}. ${formatLocation(property.location) || 'Luxury real estate'}`
  const image = getFirstImage(property.media)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    title: `${title} | Propertize`,
    description,
    openGraph: {
      title: `${title} | Propertize - Live & Rise`,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Propertize`,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/property/${slug}`,
    },
  }
}

function buildJsonLd(property: Awaited<ReturnType<typeof fetchPropertyByIdServer>>, slug: string) {
  if (!property) return null
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const image = getFirstImage(property.media)
  const address = property.location
    ? {
        '@type': 'PostalAddress',
        streetAddress: property.location.streetaddress,
        addressLocality: property.location.city,
        addressRegion: property.location.state,
        postalCode: property.location.zip_code,
      }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name: property.title ?? 'Property',
    description: property.about_property ?? undefined,
    url: `${baseUrl}/property/${slug}`,
    image: image,
    ...(address && { address }),
    numberOfRooms: property.Bedrooms ?? undefined,
    numberOfBathroomsTotal: property.Bathrooms ?? undefined,
    floorSize: property.square_feet
      ? { '@type': 'QuantitativeValue', value: property.square_feet, unitCode: 'FTK' }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price ?? undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  const id = parsePropertyIdFromSlug(slug)
  if (!id) notFound()

  const property = await fetchPropertyByIdServer(id)
  if (!property) notFound()

  const similar =
    property.listing_type
      ? await fetchSimilarPropertiesServer(property.listing_type, id, 3)
      : []

  const jsonLd = buildJsonLd(property, slug)

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PropertyDetailContent property={property} similar={similar} />
    </>
  )
}
