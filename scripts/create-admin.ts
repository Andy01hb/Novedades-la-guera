import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashed = await bcrypt.hash('Andy01hb', 12)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'andyxdjajaja@gmail.com' },
    update: { password: hashed, name: 'Andy01hb' },
    create: { email: 'andyxdjajaja@gmail.com', password: hashed, name: 'Andy01hb' },
  })
  console.log('Admin creado/actualizado:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
