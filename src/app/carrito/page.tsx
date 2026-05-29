'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/store/cart'
import CartItem from '@/components/cart/CartItem'

export default function CartPage() {
  const { items, subtotal } = useCart()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="text-dark/20 mx-auto mb-4" />
        <h1 className="text-2xl font-black text-dark mb-2">Tu carrito está vacío</h1>
        <p className="text-dark/50 mb-8">Agrega productos para comenzar</p>
        <Link href="/productos" className="btn-primary inline-block">
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-dark mb-8">
        Tu carrito <span className="text-pink">({items.length} producto{items.length !== 1 ? 's' : ''})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-80">
          <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-24">
            <h2 className="font-black text-dark text-lg mb-4">Resumen</h2>
            <div className="flex justify-between text-sm text-dark/60 mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-sm text-dark/60 mb-4">
              <span>Envío</span>
              <span>Se calcula en checkout</span>
            </div>
            <div className="border-t border-dark/5 pt-4 flex justify-between font-black text-dark text-lg mb-6">
              <span>Total estimado</span>
              <span className="text-pink">{formatPrice(subtotal())}</span>
            </div>
            <Link href="/checkout" className="btn-primary block text-center">
              Proceder al pago →
            </Link>
            <Link
              href="/productos"
              className="block text-center text-sm text-dark/50 hover:text-pink mt-3 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
