'use client'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/store/cart'
import { Product } from '@prisma/client'

export default function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1)
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category,
      priceRetail: product.priceRetail,
      priceWholesale: product.priceWholesale,
      wholesaleMin: product.wholesaleMin,
      quantity: qty,
      slug: product.slug,
    })
  }

  return (
    <div className="flex flex-col gap-3 mt-2">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-dark/60">Cantidad:</span>
        <div className="flex items-center border border-dark/10 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-pink/5 font-bold text-dark"
          >
            −
          </button>
          <span className="w-10 text-center font-bold text-dark">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-pink/5 font-bold text-dark"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={18} />
        Agregar al carrito
      </button>
    </div>
  )
}
