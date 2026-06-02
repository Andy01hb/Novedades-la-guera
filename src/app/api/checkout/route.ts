import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { customerAuthOptions } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { getStripeClient } from '@/lib/stripe'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import { DELIVERY_COSTS } from '@/types'

const CheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email(),
  street: z.string().min(3),
  colonia: z.string().min(2),
  postalCode: z.string().length(5),
  city: z.string().min(2),
  state: z.string().min(2),
  references: z.string().optional().default(''),
  deliveryType: z.nativeEnum(DeliveryType),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(customerAuthOptions)
  if (!session) {
    return NextResponse.json({ error: 'Debes iniciar sesión para realizar un pedido' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
  }

  const parsed = CheckoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  try {
    // Verificar que todos los productos existen y tienen stock
    const productIds = data.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Uno o más productos no están disponibles' },
        { status: 400 }
      )
    }

    let subtotal = 0
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`)
      }
      const unitPrice = product.priceRetail
      subtotal += unitPrice * item.quantity
      return { productId: item.productId, quantity: item.quantity, unitPrice }
    })

    const deliveryCost = DELIVERY_COSTS[data.deliveryType]
    const total = subtotal + deliveryCost

    // Crear pedido en estado PENDING antes del pago
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        street: data.street,
        colonia: data.colonia,
        postalCode: data.postalCode,
        city: data.city,
        state: data.state,
        references: data.references ?? '',
        deliveryType: data.deliveryType,
        deliveryCost,
        subtotal,
        total,
        customerId: session.user.id,
        status: 'PENDING',
        items: { create: orderItems },
      },
    })

    // Crear PaymentIntent en Stripe
    const stripe = await getStripeClient()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'mxn',
      metadata: { orderId: order.id },
      automatic_payment_methods: { enabled: true },
    })

    // Guardar el PaymentIntent ID en el pedido
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    const isStockError = error instanceof Error && error.message.startsWith('Stock insuficiente')
    const message = isStockError ? (error as Error).message : 'Error al procesar el pedido'
    return NextResponse.json({ error: message }, { status: isStockError ? 400 : 500 })
  }
}
