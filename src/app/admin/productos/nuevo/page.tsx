import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'

export default async function NuevoProductoPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <Link href="/admin/productos" className="text-admin-muted hover:text-white text-sm transition-colors">
          ← Productos
        </Link>
        <h1 className="text-white font-black text-2xl mt-2">Nuevo producto</h1>
      </div>

      <div className="bg-admin-card border border-admin-border rounded-2xl p-6">
        <ProductForm />
      </div>
    </div>
  )
}
