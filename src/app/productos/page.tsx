'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ui/ProductCard'
import CategoryChip from '@/components/ui/CategoryChip'
import { ProductPublic, CATEGORY_LABELS } from '@/types'

const CATEGORIES = ['TODO', 'BELLEZA', 'ACCESORIOS', 'HOGAR', 'DULCERIA', 'NOVEDADES']

function CatalogContent() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('cat') ?? 'TODO'

  const [activeCategory, setActiveCategory] = useState(initialCat)
  const [products, setProducts] = useState<ProductPublic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory !== 'TODO') params.set('cat', activeCategory)
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [activeCategory])

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat === 'TODO' ? 'Todo' : (CATEGORY_LABELS[cat] ?? cat)}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 bg-dark/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-dark/40">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold">No hay productos en esta categoría</p>
          <p className="text-sm mt-2">Pronto tendremos más novedades</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}

export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-dark mb-6">
        Catálogo <span className="text-pink">completo</span>
      </h1>
      <Suspense fallback={<div className="h-10 bg-dark/5 rounded-full animate-pulse w-96" />}>
        <CatalogContent />
      </Suspense>
    </div>
  )
}
