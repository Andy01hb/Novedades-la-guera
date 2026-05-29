import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import OrderStatusBadge from '@/components/ui/OrderStatusBadge'

interface Props {
  params: { id: string }
}

export default async function ConfirmacionPage({ params }: Props) {
  // Special case: Stripe redirects to /confirmacion/stripe after successful payment
  // (used as return_url in confirmPayment when redirect is required)
  if (params.id === 'stripe') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h1 className="text-2xl font-black text-dark mb-2">¡Pago recibido!</h1>
        <p className="text-dark/50 mb-6">Tu pedido está siendo procesado. Recibirás un correo de confirmación pronto.</p>
        <Link href="/" className="btn-primary inline-block">Volver a la tienda</Link>
      </div>
    )
  }

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

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-black text-dark mb-2">¡Pedido confirmado!</h1>
        <p className="text-dark/50">
          Gracias, {order.customerName}. En breve recibirás un correo de confirmación.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-dark/40 font-mono">
            #{order.id.slice(-8).toUpperCase()}
          </p>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dark/5">
            <span className="text-dark/70">
              {item.product.name} ×{item.quantity}
            </span>
            <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
          </div>
        ))}

        <div className="flex justify-between font-black text-dark pt-4">
          <span>Total pagado</span>
          <span className="text-pink">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link href={`/seguimiento/${order.id}`} className="btn-primary text-center">
          Rastrear mi pedido
        </Link>
        <Link href="/" className="btn-ghost text-center">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
