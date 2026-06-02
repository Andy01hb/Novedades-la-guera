import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.length < 3) return NextResponse.json({ predictions: [] })

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ predictions: [] })

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(q)}&language=es&components=country:mx&key=${key}`
  const res = await fetch(url)
  const data = await res.json()

  return NextResponse.json({
    predictions: (data.predictions ?? []).map((p: { description: string; place_id: string }) => ({
      description: p.description,
      placeId: p.place_id,
    })),
  })
}
