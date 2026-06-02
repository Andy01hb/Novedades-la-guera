import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.customer.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo. Inicia sesión.' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.customer.create({
    data: { id: crypto.randomUUID(), name, email, password: hashed, provider: 'credentials' },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
