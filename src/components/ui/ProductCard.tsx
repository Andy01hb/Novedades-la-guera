'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { ProductPublic, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types'
import { useCart } from '@/store/cart'

interface ProductCardProps {
  product: ProductPublic
}

const BADGE_STYLES: Record<string, string> = {
  NUEVO: 'bg-pink text-white',
  OFERTA: 'bg-yellow text-dark',
  MAYOREO: 'bg-dark text-white',
}

const BADGE_LABELS: Record<string, string> = {
  NUEVO: 'NUEVO',
  OFERTA: 'OFERTA',
  MAYOREO: 'MAYOREO',
}

export default function ProductCard({ product }: ProductCardProps) {
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
      quantity: 1,
      slug: product.slug,
    })
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="card-product relative flex flex-col">
      {/* Badge */}
      {product.badge && (
        <span
          className={`absolute top-3 left-3 z-10 text-xs font-bold px-2 py-1 rounded-full ${BADGE_STYLES[product.badge] ?? 'bg-dark text-white'}`}
        >
          {BADGE_LABELS[product.badge] ?? product.badge}
        </span>
      )}

      {/* Wishlist */}
      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:text-pink transition-colors">
        <Heart size={16} />
      </button>

      {/* Imagen */}
      <Link href={`/productos/${product.slug}`}>
        <div className={`relative h-48 ${CATEGORY_COLORS[product.category] ?? 'bg-gray-100'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs text-dark/50 font-medium uppercase tracking-wide">
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-bold text-dark text-sm leading-tight hover:text-pink transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.priceWholesale && product.wholesaleMin && (
          <p className="text-xs text-pink-light font-medium">
            Mayoreo {product.wholesaleMin}+ piezas: {formatPrice(product.priceWholesale)} c/u
          </p>
        )}

        <p className="text-xl font-black text-pink">{formatPrice(product.priceRetail)}</p>

        <button
          onClick={handleAdd}
          className="mt-auto btn-primary flex items-center justify-center gap-2 text-sm py-2"
        >
          <ShoppingCart size={16} />
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}
