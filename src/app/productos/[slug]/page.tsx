import { notFound } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import AddToCartButton from './AddToCartButton'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'

interface Props {
  params: { slug: string }
}

export default async function ProductPage({ params }: Props) {
  let product = null
  try {
    product = await prisma.product.findUnique({
      where: { slug: params.slug, active: true },
    })
  } catch {
    notFound()
  }

  if (!product) notFound()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Imagen */}
        <div className={`relative h-80 lg:h-96 rounded-3xl overflow-hidden ${CATEGORY_COLORS[product.category] ?? 'bg-gray-100'}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <span className="text-sm text-dark/50 font-medium uppercase tracking-wide">
            {CATEGORY_LABELS[product.category] ?? product.category}
          </span>
          <h1 className="text-3xl font-black text-dark">{product.name}</h1>

          {product.description && (
            <p className="text-dark/60 leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-pink">{formatPrice(product.priceRetail)}</p>
            <span className="text-sm text-dark/40 mb-1">por pieza</span>
          </div>

          {product.priceWholesale && product.wholesaleMin && (
            <div className="bg-pink/5 border border-pink/20 rounded-2xl p-4">
              <p className="text-sm font-bold text-pink mb-1">💰 Precio mayoreo</p>
              <p className="text-2xl font-black text-dark">{formatPrice(product.priceWholesale)}</p>
              <p className="text-xs text-dark/50 mt-1">
                A partir de {product.wholesaleMin} piezas
              </p>
            </div>
          )}

          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ ${product.stock} disponibles` : '✗ Sin stock'}
          </p>

          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
