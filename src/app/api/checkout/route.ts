import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { customerAuthOptions } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { getStripeClient } from '@/lib/stripe'
import { getLocalShippingCost } from '@/lib/shipping'
import { z } from 'zod'
import { DeliveryType } from '@prisma/client'
import { DELIVERY_COSTS } from '@/types'

// deliveryCost eliminado del schema — se calcula server-side
const CheckoutSchema = z.object({
  customerName:  z.string().min(2),
  customerPhone: z.string().min(10),
  customerEmail: z.string().email(),
  street:        z.string().default(''),
  colonia:       z.string().default(''),
  postalCode:    z.string().default(''),
  city:          z.string().default(''),
  state:         z.string().default(''),
  references:    z.string().optional().default(''),
  deliveryType:  z.nativeEnum(DeliveryType),
  items: z.array(z.object({
    productId: z.string(),
    quantity:  z.number().int().positive(),
  })).min(1),
}).superRefine((data, ctx) => {
  if (data.deliveryType !== DeliveryType.RECOGER) {
    if (data.street.length < 3)       ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Calle requerida', path: ['street'] })
    if (data.colonia.length < 2)      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Colonia requerida', path: ['colonia'] })
    if (data.postalCode.length !== 5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'CP de 5 dígitos', path: ['postalCode'] })
    if (data.city.length < 2)         ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ciudad requerida', path: ['city'] })
    if (data.state.length < 2)        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Estado requerido', path: ['state'] })
  }
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
    return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // ── 1. Calcular costo de envío server-side ────────────────────────────────
  let deliveryCost: number
  try {
    if (data.deliveryType === DeliveryType.LOCAL) {
      const address = [data.street, data.colonia, data.city, data.state].filter(Boolean).join(', ')
      const estimate = await getLocalShippingCost(address)
      deliveryCost = estimate.cost
    } else {
      deliveryCost = DELIVERY_COSTS[data.deliveryType]
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo calcular el costo de envío'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // ── 2. Cargar productos ───────────────────────────────────────────────────
  const productIds = data.items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 })
  }

  let subtotal = 0
  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!
    const unitPrice = product.priceRetail
    subtotal += unitPrice * item.quantity
    return { productId: item.productId, quantity: item.quantity, unitPrice }
  })

  const total = subtotal + deliveryCost

  // ── 3. Transacción atómica: check+decremento de stock + creación de pedido ─
  let order: { id: string }
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, active: true, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (updated.count === 0) {
          const product = products.find((p) => p.id === item.productId)!
          throw new Error(`Stock insuficiente para ${product.name}`)
        }
      }

      return tx.order.create({
        data: {
          customerName:  data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          street:        data.street,
          colonia:       data.colonia,
          postalCode:    data.postalCode,
          city:          data.city,
          state:         data.state,
          references:    data.references ?? '',
          deliveryType:  data.deliveryType,
          deliveryCost,
          subtotal,
          total,
          customerId: session.user.id,
          status:     'PENDING',
          items:      { create: orderItems },
        },
        select: { id: true },
      })
    })
  } catch (error) {
    const isStockError = error instanceof Error && error.message.startsWith('Stock insuficiente')
    const message = isStockError ? (error as Error).message : 'Error al procesar el pedido'
    return NextResponse.json({ error: message }, { status: isStockError ? 400 : 500 })
  }

  // ── 4. Crear PaymentIntent en Stripe (fuera de la transacción) ───────────
  let paymentIntent: { id: string; client_secret: string | null }
  try {
    const stripe = await getStripeClient()
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: total,
        currency: 'mxn',
        metadata: { orderId: order.id },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: order.id }
    )
  } catch {
    // Stripe falló: intentar revertir el stock y cancelar el pedido
    try {
      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
        await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
      })
    } catch (compensationErr) {
      console.error('Failed to compensate order after Stripe error:', compensationErr)
    }
    return NextResponse.json(
      { error: 'Error al conectar con el procesador de pagos. Por favor intenta de nuevo.' },
      { status: 500 }
    )
  }

  try {
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    })
  } catch (err) {
    console.error('Failed to persist stripePaymentIntentId for order', order.id, err)
    // El pedido existe y el PI existe; el admin puede reconciliar manualmente.
    // No bloqueamos al cliente — continuamos.
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId: order.id })
}
