import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Category, ProductBadge } from '@prisma/client'

const rowSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(Category),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  priceRetail: z.number().int().positive(),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  active: z.boolean().default(true),
})

type BulkRow = z.infer<typeof rowSchema>

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ error: 'Se esperaba un array de productos' }, { status: 400 })
  }
  if (body.length > 500) {
    return NextResponse.json({ error: 'Máximo 500 productos por importación' }, { status: 400 })
  }

  const valid: BulkRow[] = []
  const errors: { row: number; reason: string }[] = []

  for (let i = 0; i < body.length; i++) {
    const result = rowSchema.safeParse(body[i])
    if (result.success) {
      valid.push(result.data)
    } else {
      const reason = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      errors.push({ row: i + 2, reason }) // +2 porque fila 1 es encabezado
    }
  }

  let imported = 0
  const insertErrors: { row: number; reason: string }[] = []

  for (let i = 0; i < valid.length; i++) {
    try {
      await prisma.product.create({ data: { ...valid[i], imageUrl: valid[i].imageUrl ?? '' } })
      imported++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al insertar'
      const originalRow = body.indexOf(valid[i]) + 2
      insertErrors.push({ row: originalRow, reason: msg.includes('Unique') ? 'El slug ya existe' : msg })
    }
  }

  return NextResponse.json({
    imported,
    errors: [...errors, ...insertErrors],
  })
}
