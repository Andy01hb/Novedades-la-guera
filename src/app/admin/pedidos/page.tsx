import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'
import Link from 'next/link'
import { OrderStatus, Prisma } from '@prisma/client'

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { select: { name: true } } }; take: 2 }
  }
}>

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Nuevos' },
  { value: 'PREPARING', label: 'Preparando' },
  { value: 'SHIPPED', label: 'Enviados' },
  { value: 'DELIVERED', label: 'Entregados' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

interface Props {
  searchParams: { status?: string }
}

export default async function PedidosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const VALID_STATUSES = Object.values(OrderStatus)
  const statusParam = searchParams.status
  const statusFilter: OrderStatus | undefined =
    statusParam && statusParam !== 'ALL' && VALID_STATUSES.includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined

  let orders: OrderWithItems[] = []

  try {
    orders = await prisma.order.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: { select: { name: true } } },
          take: 2,
        },
      },
    })
  } catch {
    // DB not connected
  }

  const activeStatus = searchParams.status ?? 'ALL'

  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-white font-black text-2xl mb-6">Pedidos</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {ALL_STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={value === 'ALL' ? '/admin/pedidos' : `/admin/pedidos?status=${value}`}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeStatus === value
                ? 'bg-pink text-white'
                : 'bg-admin-card text-admin-muted hover:text-white border border-admin-border'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-2xl p-8 text-center">
          <p className="text-admin-muted">No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden">
          {/* Desktop */}
          <table className="hidden lg:table w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border">
                {['Pedido', 'Cliente', 'Teléfono', 'Productos', 'Envío', 'Total', 'Estado', 'Fecha', ''].map((h) => (
                  <th key={h} className="text-left text-admin-muted font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-admin-border last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-admin-muted text-xs">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{order.customerName}</td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{order.customerPhone}</td>
                  <td className="px-4 py-3 text-admin-muted text-xs">
                    {order.items[0]?.product.name}
                    {order.items.length > 1 && ` +(${order.items.length - 1})`}
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{order.deliveryType}</td>
                  <td className="px-4 py-3 text-white font-bold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-3 text-admin-muted text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${order.id}`} className="text-pink text-xs hover:underline">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile */}
          <div className="lg:hidden divide-y divide-admin-border">
            {orders.map((order) => (
              <Link key={order.id} href={`/admin/pedidos/${order.id}`} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                <div>
                  <p className="text-white font-medium text-sm">{order.customerName}</p>
                  <p className="text-admin-muted text-xs mt-0.5">{order.customerPhone}</p>
                  <p className="text-admin-muted text-xs font-mono mt-0.5">
                    #{order.id.slice(-6).toUpperCase()} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
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
  )
}
