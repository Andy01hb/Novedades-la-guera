import { getServerSession } from 'next-auth/next'
import { customerAuthOptions } from '@/lib/customer-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default async function PedidosPage() {
  const session = await getServerSession(customerAuthOptions)
  if (!session) redirect('/cuenta/login?returnTo=/cuenta/pedidos')

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      items: {
        include: { product: { select: { name: true } } },
        take: 2,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-dark">Mis pedidos</h1>
        <p className="text-dark/50 text-sm mt-1">{session.user.name}</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-dark/60 mb-4">Aún no tienes pedidos</p>
          <Link href="/" className="btn-primary inline-block">Explorar la tienda</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const productNames = order.items.map(i => i.product.name).join(', ')
            const hasMore = order.items.length === 2
            return (
              <div key={order.id} className="bg-white rounded-3xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-dark/40 font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-dark text-sm font-medium truncate">
                      {productNames}{hasMore ? '...' : ''}
                    </p>
                    <p className="text-dark/40 text-xs mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-pink font-black">{formatPrice(order.total)}</p>
                    <Link href={`/confirmacion/${order.id}`} className="text-xs text-dark/40 hover:text-pink transition-colors mt-1 block">
                      Ver detalle →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
