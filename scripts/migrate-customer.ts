import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  console.log('Creando tabla Customer...')
  await sql`
    CREATE TABLE IF NOT EXISTS "Customer" (
      "id"         TEXT NOT NULL,
      "name"       TEXT NOT NULL,
      "email"      TEXT NOT NULL,
      "password"   TEXT,
      "image"      TEXT,
      "provider"   TEXT,
      "providerId" TEXT,
      "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
    )
  `

  console.log('Creando índice único en Customer.email...')
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "Customer_email_key" ON "Customer"("email")
  `

  console.log('Agregando columna customerId a Order...')
  await sql`
    ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "customerId" TEXT
  `

  console.log('Agregando foreign key...')
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'Order_customerId_fkey'
      ) THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey"
          FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$
  `

  console.log('✅ Migración completada.')
}

main().catch((e) => { console.error(e); process.exit(1) })
