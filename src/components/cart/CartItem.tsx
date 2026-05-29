'use client'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/store/cart'
import { CartItem as CartItemType, CATEGORY_COLORS } from '@/types'

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="flex gap-4 py-4 border-b border-dark/5">
      <div className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 ${CATEGORY_COLORS[item.category] ?? 'bg-gray-100'}`}>
        <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-dark text-sm leading-tight">{item.name}</p>
        {item.priceWholesale && item.wholesaleMin && item.quantity >= item.wholesaleMin && (
          <p className="text-xs text-[#FF6BB3] mt-0.5">
            Precio mayoreo aplicado
          </p>
        )}
        <p className="text-pink font-bold mt-1">
          {formatPrice(item.priceRetail)} c/u
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-dark/10 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-pink/5 font-bold"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-pink/5 font-bold"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="text-dark/30 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-black text-dark">
          {formatPrice(item.priceRetail * item.quantity)}
        </p>
      </div>
    </div>
  )
}
