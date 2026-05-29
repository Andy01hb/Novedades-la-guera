import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StatsCard from '@/components/admin/StatsCard'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import Link from 'next/link'
import { OrderStatus, Prisma } from '@prisma/client'

type RecentOrder = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { select: { name: true } } }; take: 2 }
  }
}>

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let stats = { ordersToday: 0, salesToday: 0, pending: 0, shipped: 0 }
  let recentOrders: RecentOrder[] = []

  try {
    const [ordersToday, pending, shipped, recent] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { name: true } } }, take: 2 },
        },
      }),
    ])

    stats = {
      ordersToday: ordersToday.length,
      salesToday: ordersToday.reduce((sum, o) => sum + o.total, 0),
      pending,
      shipped,
    }
    recentOrders = recent
  } catch {
    // DB not connected — show empty state
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">
          {greeting}, {session.user?.name?.split(' ')[0] ?? 'Admin'} 👋
        </h1>
        <p className="text-admin-muted text-sm mt-1">
          {new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date())}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Pedidos hoy" value={stats.ordersToday} icon="📦" />
        <StatsCard
          title="Ventas hoy"
          value={formatPrice(stats.salesToday)}
          icon="💰"
          color="text-green-400"
        />
        <StatsCard title="Pendientes" value={stats.pending} icon="🔵" color="text-blue-400" />
        <StatsCard title="En camino" value={stats.shipped} icon="🚀" color="text-purple-400" />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-pink text-sm hover:underline">
            Ver todos →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-admin-card border border-admin-border rounded-2xl p-8 text-center">
            <p className="text-admin-muted">No hay pedidos aún</p>
          </div>
        ) : (
          <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden">
            {/* Desktop table */}
            <table className="hidden lg:table w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Pedido</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Cliente</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Productos</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Total</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Estado</th>
                  <th className="text-left text-admin-muted font-medium px-5 py-3">Fecha</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-admin-border last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono text-admin-muted text-xs">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-white font-medium">{order.customerName}</td>
                    <td className="px-5 py-3 text-admin-muted">
                      {order.items[0]?.product.name}
                      {order.items.length > 1 && ` +${order.items.length - 1}`}
                    </td>
                    <td className="px-5 py-3 text-white font-bold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="px-5 py-3 text-admin-muted text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-pink text-xs hover:underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <div className="lg:hidden divide-y divide-admin-border">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                  <div>
                    <p className="text-white font-medium text-sm">{order.customerName}</p>
                    <p className="text-admin-muted text-xs mt-0.5 font-mono">
                      #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{formatPrice(order.total)}</p>
                    <div className="mt-1">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
