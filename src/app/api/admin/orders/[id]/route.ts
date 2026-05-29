import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { z } from 'zod'

const UpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
    })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
  }
}
