import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Category, ProductBadge, Prisma } from '@prisma/client'

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
  category: z.nativeEnum(Category),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url(),
  priceRetail: z.number().int().positive(),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  active: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const product = await prisma.product.create({ data: parsed.data })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    const isUniqueViolation =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
    const message = isUniqueViolation
      ? 'Ya existe un producto con ese slug'
      : 'Error al crear el producto'
    return NextResponse.json({ error: message }, { status: isUniqueViolation ? 409 : 500 })
  }
}
