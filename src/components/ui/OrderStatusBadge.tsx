import { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string; icon: string }> = {
  PENDING:    { label: 'Nuevo',      cls: 'bg-blue-100 text-blue-700',    icon: '🔵' },
  PREPARING:  { label: 'En proceso', cls: 'bg-yellow/20 text-yellow-700', icon: '🟡' },
  SHIPPED:    { label: 'Enviado',    cls: 'bg-purple-100 text-purple-700', icon: '🚀' },
  DELIVERED:  { label: 'Entregado',  cls: 'bg-green-100 text-green-700',  icon: '✅' },
  CANCELLED:  { label: 'Cancelado',  cls: 'bg-red-100 text-red-700',      icon: '❌' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls, icon } = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {icon} {label}
    </span>
  )
}
