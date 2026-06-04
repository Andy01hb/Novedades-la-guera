import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

async function restoreStockAndCancel(piId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { stripePaymentIntentId: piId },
      include: { items: true },
    })
    if (!order || order.status !== 'PENDING') return

    const updated = await tx.order.updateMany({
      where: { id: order.id, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    })
    if (updated.count === 0) return

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      })
    }
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = await getStripeClient()
    const webhookSecret = await getStripeWebhookSecret()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    return NextResponse.json({ error: `Webhook signature invalid: ${message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent
    try {
      await prisma.order.update({
        where: { stripePaymentIntentId: pi.id },
        data: { status: 'PREPARING', paidAt: new Date() },
      })
    } catch (err) {
      console.error('Failed to update order after payment:', err)
      // Retornamos 200 para que Stripe no reintente; el admin verá el pedido en PENDING
    }
  }

  if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    const pi = event.data.object as Stripe.PaymentIntent
    try {
      await restoreStockAndCancel(pi.id)
    } catch (err) {
      console.error(`Failed to restore stock on ${event.type}:`, err)
    }
  }

  return NextResponse.json({ received: true })
}
