import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'
import Stripe from 'stripe'
import { z } from 'zod'

const StripeConfigSchema = z.object({
  publicKey: z.string().min(1).startsWith('pk_'),
  secretKey: z.string().min(1).startsWith('sk_'),
  webhookSecret: z.string().min(1).startsWith('whsec_'),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const settings = await prisma.siteSettings.findMany({
    where: { key: { in: ['stripe_public_key', 'stripe_secret_key', 'stripe_webhook_secret'] } },
  })

  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const configured = !!map['stripe_secret_key']

  return NextResponse.json({
    configured,
    publicKeyHint: map['stripe_public_key']
      ? `${map['stripe_public_key'].slice(0, 8)}...${map['stripe_public_key'].slice(-4)}`
      : null,
    secretKeyConfigured: !!map['stripe_secret_key'],
    webhookConfigured: !!map['stripe_webhook_secret'],
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = StripeConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const { publicKey, secretKey, webhookSecret } = parsed.data

  // Verificar que la secret key es válida contra Stripe
  try {
    const testStripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia', typescript: true })
    await testStripe.balance.retrieve()
  } catch {
    return NextResponse.json({ error: 'La Secret Key de Stripe es inválida o no tiene permisos suficientes.' }, { status: 400 })
  }

  // Guardar: public key sin cifrar, secret y webhook cifrados
  await prisma.$transaction([
    prisma.siteSettings.upsert({
      where: { key: 'stripe_public_key' },
      update: { value: publicKey },
      create: { key: 'stripe_public_key', value: publicKey },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'stripe_secret_key' },
      update: { value: encrypt(secretKey) },
      create: { key: 'stripe_secret_key', value: encrypt(secretKey) },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'stripe_webhook_secret' },
      update: { value: encrypt(webhookSecret) },
      create: { key: 'stripe_webhook_secret', value: encrypt(webhookSecret) },
    }),
  ])

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  await prisma.siteSettings.deleteMany({
    where: { key: { in: ['stripe_public_key', 'stripe_secret_key', 'stripe_webhook_secret'] } },
  })

  return NextResponse.json({ ok: true })
}
