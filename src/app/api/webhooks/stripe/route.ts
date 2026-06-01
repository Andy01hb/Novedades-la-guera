import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

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
        data: {
          status: 'PREPARING',
          paidAt: new Date(),
        },
      })
    } catch (err) {
      console.error('Failed to update order after payment:', err)
      // Return 200 to Stripe anyway — the event will not be retried for DB errors
      // but we log it for manual review
    }
  }

  return NextResponse.json({ received: true })
}
