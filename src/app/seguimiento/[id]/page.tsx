import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import { OrderStatus } from '@prisma/client'

interface Props {
  params: { id: string }
}

const STATUS_STEPS: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED']

const STATUS_STEP_LABELS: Record<string, string> = {
  PENDING:   'Pedido recibido',
  PREPARING: 'Preparando pedido',
  SHIPPED:   'En camino',
  DELIVERED: '¡Entregado!',
}

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  LOCAL:       '🏍️ Entrega local Juárez',
  PAQUETERIA:  '📦 Paquetería nacional',
  RECOGER:     '🏪 Recoger en tienda',
}

export default async function SeguimientoPage({ params }: Props) {
  let order = null
  try {
    order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    })
  } catch {
    notFound()
  }

  if (!order) notFound()

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-dark mb-1">Estado de tu pedido</h1>
      <p className="text-dark/50 text-sm mb-6 font-mono">
        #{order.id.slice(-8).toUpperCase()}
      </p>

      {/* Resumen del pedido */}
      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-dark">{order.customerName}</p>
            <p className="text-xs text-dark/50 mt-0.5">
              {DELIVERY_TYPE_LABELS[order.deliveryType] ?? order.deliveryType}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Timeline de estados */}
        <div className="space-y-3 mb-6">
          {STATUS_STEPS.map((status, i) => {
            const isDone = i <= currentStep
            const isCurrent = i === currentStep
            return (
              <div key={status} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                    isDone ? 'bg-pink text-white' : 'bg-dark/10 text-dark/30'
                  }`}
                >
                  {isDone && i < currentStep ? '✓' : i + 1}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-pink' : isDone ? 'text-dark' : 'text-dark/30'
                    }`}
                  >
                    {STATUS_STEP_LABELS[status]}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-dark/40">En curso</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Dirección */}
        {order.deliveryType !== 'RECOGER' && (
          <div className="bg-cream rounded-2xl p-4 text-sm">
            <p className="font-medium text-dark mb-1">Dirección de entrega</p>
            <p className="text-dark/60">
              {order.street}, {order.colonia}
            </p>
            <p className="text-dark/60">
              {order.city}, {order.state} {order.postalCode}
            </p>
          </div>
        )}
      </div>

      {/* Productos del pedido */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="font-bold text-dark mb-3 text-sm">Productos</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dark/5 last:border-0">
            <span className="text-dark/70">
              {item.product.name} ×{item.quantity}
            </span>
            <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between font-black text-dark pt-3">
          <span>Total</span>
          <span className="text-pink">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
