import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Category, ProductBadge, Prisma } from '@prisma/client'

const UpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(Category).optional(),
  badge: z.nativeEnum(ProductBadge).optional().nullable(),
  imageUrl: z.string().url().optional(),
  priceRetail: z.number().int().positive().optional(),
  priceWholesale: z.number().int().positive().optional().nullable(),
  wholesaleMin: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  try {
    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    })
    return NextResponse.json(product)
  } catch (error) {
    const isNotFound =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
    return NextResponse.json(
      { error: isNotFound ? 'Producto no encontrado' : 'Error del servidor' },
      { status: isNotFound ? 404 : 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { active: false },
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const isNotFound =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
    return NextResponse.json(
      { error: isNotFound ? 'Producto no encontrado' : 'Error del servidor' },
      { status: isNotFound ? 404 : 500 }
    )
  }
}
