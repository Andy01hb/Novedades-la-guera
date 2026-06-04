import { NextRequest, NextResponse } from 'next/server'
import { limiters, getIp, checkLimit } from '@/lib/ratelimit'

type Component = { long_name: string; types: string[] }

function pick(components: Component[], type: string) {
  return components.find(c => c.types.includes(type))?.long_name ?? null
}

export async function GET(req: NextRequest) {
  const limited = await checkLimit(limiters.maps, getIp(req))
  if (limited) return limited
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')
  if (!lat || !lng) return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Google Maps no configurado' }, { status: 503 })

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${key}`
  const res = await fetch(url)
  const data = await res.json()

  if (!data.results?.length) return NextResponse.json({ error: 'No se encontró dirección' }, { status: 404 })

  const result = data.results[0]
  const c: Component[] = result.address_components ?? []
  const streetNumber = pick(c, 'street_number')
  const route = pick(c, 'route')

  return NextResponse.json({
    address: result.formatted_address,
    street: route ? `${route}${streetNumber ? ' ' + streetNumber : ''}` : null,
    colonia: pick(c, 'neighborhood') ?? pick(c, 'sublocality_level_1') ?? pick(c, 'sublocality'),
    postalCode: pick(c, 'postal_code'),
    city: pick(c, 'locality') ?? pick(c, 'administrative_area_level_2'),
    state: pick(c, 'administrative_area_level_1'),
  })
}
