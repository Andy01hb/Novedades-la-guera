import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import ProductImporter from '@/components/admin/ProductImporter'

export default async function ImportarProductosPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/productos"
          className="flex items-center gap-1 text-admin-muted hover:text-white text-sm mb-4 transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Productos
        </Link>
        <h1 className="text-white font-black text-2xl">Importar productos</h1>
        <p className="text-admin-muted text-sm mt-1">Sube un archivo Excel para agregar múltiples productos de golpe</p>
      </div>

      <ProductImporter />
    </div>
  )
}
