'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category, ProductBadge } from '@prisma/client'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url('URL inválida'),
  priceRetail: z.number().int().positive('Precio requerido'),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0, 'Stock requerido'),
  active: z.boolean(),
})

type FormData = z.infer<typeof schema>

const CATEGORY_OPTIONS = [
  { value: 'BELLEZA', label: 'Belleza' },
  { value: 'ACCESORIOS', label: 'Accesorios' },
  { value: 'HOGAR', label: 'Hogar' },
  { value: 'DULCERIA', label: 'Dulcería' },
  { value: 'NOVEDADES', label: 'Novedades' },
]

const inputClass = 'w-full px-3 py-2.5 bg-admin-bg border border-admin-border rounded-xl text-white text-sm focus:border-pink outline-none transition-colors'
const labelClass = 'text-admin-muted text-sm font-medium block mb-1.5'

interface Props {
  defaultValues?: Partial<FormData>
  productId?: string
}

export default function ProductForm({ defaultValues, productId }: Props) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true,
      stock: 0,
      ...defaultValues,
    },
  })

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    const url = productId
      ? `/api/admin/products/${productId}`
      : '/api/admin/products'
    const method = productId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      setSubmitError(json.error ?? 'Error al guardar el producto')
      return
    }

    router.push('/admin/productos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre del producto</label>
          <input {...register('name')} className={inputClass} placeholder="Set de Sombras Glam" />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Slug (URL)</label>
          <input {...register('slug')} className={inputClass} placeholder="set-sombras-glam" />
          {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register('description')}
            className={`${inputClass} resize-none h-20`}
            placeholder="Descripción del producto..."
          />
        </div>

        <div>
          <label className={labelClass}>Categoría</label>
          <select {...register('category')} className={inputClass}>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Badge</label>
          <select
            {...register('badge', {
              setValueAs: (v: unknown) => (v === '' ? null : v),
            })}
            className={inputClass}
          >
            <option value="">Sin badge</option>
            <option value="NUEVO">NUEVO</option>
            <option value="OFERTA">OFERTA</option>
            <option value="MAYOREO">MAYOREO</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClass}>URL de imagen (Cloudinary)</label>
          <input {...register('imageUrl')} className={inputClass} placeholder="https://res.cloudinary.com/..." />
          {errors.imageUrl && <p className="text-red-400 text-xs mt-1">{errors.imageUrl.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Precio menudeo (centavos)</label>
          <input
            {...register('priceRetail', { valueAsNumber: true })}
            type="number"
            className={inputClass}
            placeholder="18000 = $180 MXN"
          />
          {errors.priceRetail && <p className="text-red-400 text-xs mt-1">{errors.priceRetail.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Stock</label>
          <input
            {...register('stock', { valueAsNumber: true })}
            type="number"
            className={inputClass}
            min={0}
          />
          {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Precio mayoreo (centavos, opcional)</label>
          <input
            {...register('priceWholesale', {
              valueAsNumber: true,
              setValueAs: (v: unknown) => (v === '' || (typeof v === 'number' && isNaN(v))) ? null : v,
            })}
            type="number"
            className={inputClass}
            placeholder="14000 = $140 MXN"
          />
        </div>

        <div>
          <label className={labelClass}>Mínimo mayoreo (piezas)</label>
          <input
            {...register('wholesaleMin', {
              valueAsNumber: true,
              setValueAs: (v: unknown) => (v === '' || (typeof v === 'number' && isNaN(v))) ? null : v,
            })}
            type="number"
            className={inputClass}
            placeholder="6"
          />
        </div>

        <div className="col-span-2 flex items-center gap-3">
          <input
            {...register('active')}
            type="checkbox"
            id="active"
            className="w-4 h-4 accent-pink"
          />
          <label htmlFor="active" className="text-white text-sm font-medium">
            Producto activo (visible en la tienda)
          </label>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink text-white font-bold px-6 py-2.5 rounded-xl hover:bg-pink/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : productId ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <Link
          href="/admin/productos"
          className="px-6 py-2.5 rounded-xl text-admin-muted hover:text-white border border-admin-border hover:border-white/20 transition-colors text-sm font-medium"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
