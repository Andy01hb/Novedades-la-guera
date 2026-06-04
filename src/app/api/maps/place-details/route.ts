import { NextRequest, NextResponse } from 'next/server'
import { limiters, getIp, checkLimit } from '@/lib/ratelimit'

type Component = { long_name: string; types: string[] }

function pick(components: Component[], type: string) {
  return components.find(c => c.types.includes(type))?.long_name ?? null
}

export async function GET(req: NextRequest) {
  const limited = await checkLimit(limiters.maps, getIp(req))
  if (limited) return limited
  const placeId = req.nextUrl.searchParams.get('placeId')
  if (!placeId) return NextResponse.json({ error: 'placeId requerido' }, { status: 400 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Google Maps no configurado' }, { status: 503 })

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address&language=es&key=${key}`
  const res = await fetch(url)
  const data = await res.json()

  const result = data.result
  if (!result) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

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
