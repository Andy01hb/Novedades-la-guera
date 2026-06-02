import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const tierSchema = z.object({
  label:      z.string().min(1),
  minKm:      z.number().min(0),
  maxKm:      z.number().positive().optional().nullable(),
  fixedPrice: z.number().int().min(0).optional().nullable(),
  basePrice:  z.number().int().min(0).optional().nullable(),
  pricePerKm: z.number().int().min(0).optional().nullable(),
  order:      z.number().int().default(0),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [tiers, address] = await Promise.all([
    prisma.shippingTier.findMany({ orderBy: { order: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { key: 'store_address' } }),
  ])

  return NextResponse.json({ tiers, storeAddress: address?.value ?? '' })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()

  // Save store address
  if (body.storeAddress !== undefined) {
    await prisma.siteSettings.upsert({
      where: { key: 'store_address' },
      update: { value: body.storeAddress },
      create: { key: 'store_address', value: body.storeAddress },
    })
  }

  // Replace all tiers
  if (Array.isArray(body.tiers)) {
    const parsed = body.tiers.map((t: unknown) => tierSchema.parse(t))
    await prisma.shippingTier.deleteMany()
    await prisma.shippingTier.createMany({
      data: parsed.map((t: z.infer<typeof tierSchema>, i: number) => ({ id: crypto.randomUUID(), ...t, order: i })),
    })
  }

  return NextResponse.json({ ok: true })
}
