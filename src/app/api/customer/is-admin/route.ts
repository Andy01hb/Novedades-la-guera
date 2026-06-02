import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { customerAuthOptions } from '@/lib/customer-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(customerAuthOptions)
  if (!session?.user?.email) return NextResponse.json({ isAdmin: false })

  const admin = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  return NextResponse.json({ isAdmin: !!admin })
}
