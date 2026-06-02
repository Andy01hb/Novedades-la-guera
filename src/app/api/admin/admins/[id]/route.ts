import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (session.user?.id === params.id) {
    return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })
  }

  const count = await prisma.adminUser.count()
  if (count <= 1) {
    return NextResponse.json({ error: 'Debe quedar al menos un administrador' }, { status: 400 })
  }

  await prisma.adminUser.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
