import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { customerAuthOptions } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name:       z.string().min(2).optional(),
  phone:      z.string().optional().nullable(),
  street:     z.string().optional().nullable(),
  colonia:    z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  city:       z.string().optional().nullable(),
  state:      z.string().optional().nullable(),
})

export async function GET() {
  const session = await getServerSession(customerAuthOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, street: true, colonia: true, postalCode: true, city: true, state: true, image: true, provider: true },
  })

  return NextResponse.json(customer)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(customerAuthOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const customer = await prisma.customer.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, phone: true, street: true, colonia: true, postalCode: true, city: true, state: true },
  })

  return NextResponse.json(customer)
}
