import { NextRequest, NextResponse } from 'next/server'
import { limiters, getIp, checkLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = await checkLimit(limiters.maps, getIp(req))
  if (limited) return limited
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return new NextResponse(null, { status: 400 })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return new NextResponse(null, { status: 503 })

  const encoded = encodeURIComponent(q)
  const url = [
    'https://maps.googleapis.com/maps/api/staticmap',
    `?center=${encoded}`,
    `&zoom=15`,
    `&size=600x220`,
    `&scale=2`,
    `&markers=color:0xE91E8C%7C${encoded}`,
    `&style=feature:poi%7Cvisibility:off`,
    `&key=${key}`,
  ].join('')

  const res = await fetch(url)
  if (!res.ok) return new NextResponse(null, { status: 502 })

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
