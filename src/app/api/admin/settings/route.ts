import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const settings = await prisma.siteSettings.findMany()
  return NextResponse.json(Object.fromEntries(settings.map((s) => [s.key, s.value])))
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { key, value } = body as { key?: string; value?: unknown }

  const ALLOWED_KEYS = ['logo_url', 'hero_mascot_url']

  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'key y value requeridos' }, { status: 400 })
  }
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Clave no permitida' }, { status: 400 })
  }

  const setting = await prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  return NextResponse.json(setting)
}
