import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_LABELS } from '@/types'

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100)
}

export default async function ProductosAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    // DB not connected
  }

  const activeCount = products.filter((p) => p.active).length

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-black text-2xl">Productos</h1>
          <p className="text-admin-muted text-sm mt-1">
            {activeCount} activos · {products.length} total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-pink text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-pink/90 transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-2xl p-8 text-center">
          <p className="text-admin-muted mb-4">No hay productos aún</p>
          <Link href="/admin/productos/nuevo" className="text-pink hover:underline text-sm">
            Crear el primer producto →
          </Link>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-admin-border">
                <th className="text-left text-admin-muted font-medium px-4 py-3">Producto</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3 hidden md:table-cell">Categoría</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3">Precio</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3 hidden md:table-cell">Stock</th>
                <th className="text-left text-admin-muted font-medium px-4 py-3 hidden md:table-cell">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-admin-border last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="text-white font-medium">{product.name}</p>
                        <p className="text-admin-muted text-xs font-mono">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-admin-muted hidden md:table-cell">
                    {CATEGORY_LABELS[product.category as string] ?? product.category}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {formatPrice(product.priceRetail)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : 'text-white'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      product.active ? 'bg-green-900/30 text-green-400' : 'bg-admin-bg text-admin-muted'
                    }`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="text-pink text-xs hover:underline"
                    >
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
