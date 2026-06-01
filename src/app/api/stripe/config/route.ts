import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'stripe_public_key' } })
  if (!setting?.value) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 503 })
  }
  return NextResponse.json({ publicKey: setting.value })
}
