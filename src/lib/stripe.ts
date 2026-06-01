import 'server-only'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'

export async function getStripeClient(): Promise<Stripe> {
  const [secretSetting, webhookSetting] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { key: 'stripe_secret_key' } }),
    prisma.siteSettings.findUnique({ where: { key: 'stripe_webhook_secret' } }),
  ])

  if (!secretSetting?.value) {
    throw new Error('Stripe no está configurado. Ve a Admin → Configuración para agregar tus claves.')
  }

  const secretKey = decrypt(secretSetting.value)

  return new Stripe(secretKey, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  })
}

export async function getStripeWebhookSecret(): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'stripe_webhook_secret' } })
  if (!setting?.value) throw new Error('Stripe webhook secret no configurado.')
  return decrypt(setting.value)
}
