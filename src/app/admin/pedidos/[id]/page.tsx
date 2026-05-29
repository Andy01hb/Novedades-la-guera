import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import OrderStatusUpdater from './OrderStatusUpdater'
import { OrderStatus } from '@prisma/client'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

const DELIVERY_LABELS: Record<string, string> = {
  LOCAL: '🏍️ Entrega local Juárez',
  PAQUETERIA: '📦 Paquetería nacional',
  RECOGER: '🏪 Recoger en tienda',
}

export default async function PedidoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let order = null
  try {
    order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true, slug: true } },
          },
        },
      },
    })
  } catch {
    notFound()
  }

  if (!order) notFound()

  return (
    <div className="p-4 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pedidos" className="text-admin-muted hover:text-white text-sm transition-colors">
          ← Pedidos
        </Link>
        <span className="text-admin-border">/</span>
        <span className="text-white font-mono text-sm">#{order.id.slice(-6).toUpperCase()}</span>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Productos */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Productos ({order.items.length})</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{item.product.name}</p>
                    <p className="text-admin-muted text-xs">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-bold text-sm">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-admin-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-admin-muted">Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-admin-muted">Envío ({DELIVERY_LABELS[order.deliveryType] ?? order.deliveryType})</span>
                <span className="text-white">{order.deliveryCost === 0 ? 'Gratis' : formatPrice(order.deliveryCost)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-pink text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-3">Dirección de entrega</h2>
            <div className="text-admin-muted text-sm space-y-1">
              <p className="text-white">{order.street}</p>
              <p>Col. {order.colonia}</p>
              <p>{order.city}, {order.state} C.P. {order.postalCode}</p>
              {order.references && (
                <p className="text-admin-muted italic">Ref: {order.references}</p>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-5">
          {/* Datos del cliente */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-3">Cliente</h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-medium">{order.customerName}</p>
              <p className="text-admin-muted">{order.customerPhone}</p>
              <p className="text-admin-muted">{order.customerEmail}</p>
            </div>
            <a
              href={`https://wa.me/52${order.customerPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-center bg-green-600/20 text-green-400 border border-green-600/30 py-2 px-4 rounded-xl text-sm font-medium hover:bg-green-600/30 transition-colors"
            >
              💬 Notificar por WhatsApp
            </a>
          </div>

          {/* Info del pedido */}
          <div className="bg-admin-card border border-admin-border rounded-2xl p-5">
            <h2 className="text-white font-bold mb-3">Detalles</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-admin-muted">Fecha</span>
                <span className="text-white text-xs">{formatDate(order.createdAt)}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-admin-muted">Pagado</span>
                  <span className="text-green-400 text-xs">{formatDate(order.paidAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-admin-muted">Tipo envío</span>
                <span className="text-white text-xs">{DELIVERY_LABELS[order.deliveryType]}</span>
              </div>
            </div>
          </div>

          {/* Cambiar estado */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status as OrderStatus} />
        </div>
      </div>
    </div>
  )
}
