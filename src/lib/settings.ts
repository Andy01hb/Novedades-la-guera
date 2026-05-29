import 'server-only'
import { prisma } from '@/lib/prisma'

export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { key } })
    return row?.value ?? null
  } catch {
    return null
  }
}
