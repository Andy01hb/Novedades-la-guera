import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'
import { ProductPublic } from '@/types'

export default async function FeaturedProducts() {
  let products: ProductPublic[] = []
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        badge: true,
        imageUrl: true,
        priceRetail: true,
        priceWholesale: true,
        wholesaleMin: true,
        stock: true,
      },
    })
  } catch {
    // DB not available in dev/build without connection
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-pink font-semibold text-sm mb-2">— Nuestra selección —</p>
          <h2 className="text-3xl lg:text-4xl font-black text-dark mb-3">
            Productos <span className="text-pink">Destacados</span>
          </h2>
          <p className="text-dark/50 max-w-md mx-auto">
            Lo más popular de la tienda, seleccionado especialmente para ti.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-dark/40">
            <p className="text-4xl mb-3">🛍️</p>
            <p className="font-medium">Productos disponibles próximamente</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/productos" className="btn-ghost inline-block">
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  )
}
