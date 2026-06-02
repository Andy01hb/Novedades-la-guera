import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getDistanceKm(destination: string): Promise<number> {
  const storeSetting = await prisma.siteSettings.findUnique({ where: { key: 'store_address' } })
  if (!storeSetting?.value) throw new Error('La dirección de la tienda no está configurada.')

  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('Google Maps no está configurado.')

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(storeSetting.value)}&destinations=${encodeURIComponent(destination)}&units=metric&key=${key}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK') throw new Error('No se pudo calcular la distancia.')
  const element = data.rows?.[0]?.elements?.[0]
  if (element?.status !== 'OK') throw new Error('No pudimos encontrar esa dirección. Verifica que sea correcta.')

  return element.distance.value / 1000 // meters to km
}

function calculateCost(km: number, tiers: { minKm: number; maxKm: number | null; fixedPrice: number | null; basePrice: number | null; pricePerKm: number | null; label: string }[]) {
  const sorted = [...tiers].sort((a, b) => a.minKm - b.minKm)
  const tier = sorted.find(t => km >= t.minKm && (t.maxKm === null || km < t.maxKm))
  if (!tier) return null

  let cost = 0
  if (tier.fixedPrice !== null) {
    cost = tier.fixedPrice
  } else if (tier.basePrice !== null && tier.pricePerKm !== null) {
    cost = tier.basePrice + Math.ceil(km) * tier.pricePerKm
  }

  return { cost, label: tier.label, km: Math.round(km * 10) / 10 }
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'Dirección requerida' }, { status: 400 })

  try {
    const tiers = await prisma.shippingTier.findMany({ orderBy: { order: 'asc' } })
    if (tiers.length === 0) return NextResponse.json({ error: 'No hay tarifas de envío configuradas.' }, { status: 503 })

    const km = await getDistanceKm(address)
    const result = calculateCost(km, tiers)

    if (!result) return NextResponse.json({ error: 'Lo sentimos, no entregamos en esa zona.' }, { status: 400 })

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al calcular el envío'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
