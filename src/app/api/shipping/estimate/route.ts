import { NextRequest, NextResponse } from 'next/server'
import { getLocalShippingCost } from '@/lib/shipping'
import { limiters, getIp, checkLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  const limited = await checkLimit(limiters.shipping, getIp(req))
  if (limited) return limited
  const address = req.nextUrl.searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'Dirección requerida' }, { status: 400 })

  try {
    const result = await getLocalShippingCost(address)
    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al calcular el envío'
    const status = msg === 'No hay tarifas de envío configuradas.' ? 503 : 400
    return NextResponse.json({ error: msg }, { status })
  }
}
