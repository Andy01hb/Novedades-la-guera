import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Category, ProductBadge } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cat = searchParams.get('cat')
  const badge = searchParams.get('badge')
  const mayoreo = searchParams.get('mayoreo')
  const search = searchParams.get('q')
  const takeRaw = parseInt(searchParams.get('take') ?? '20')
  const take = Number.isNaN(takeRaw) ? 20 : Math.min(Math.max(takeRaw, 1), 100)

  const where: Record<string, unknown> = { active: true }

  if (cat && Object.values(Category).includes(cat as Category)) {
    where.category = cat as Category
  }
  if (badge && Object.values(ProductBadge).includes(badge as ProductBadge)) {
    where.badge = badge as ProductBadge
  }
  if (mayoreo === 'true') {
    where.priceWholesale = { not: null }
  }
  if (search) {
    const q = search.slice(0, 100)
    where.name = { contains: q, mode: 'insensitive' }
  }

  try {
    const products = await prisma.product.findMany({
      where,
      take,
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
    return NextResponse.json(products)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}
