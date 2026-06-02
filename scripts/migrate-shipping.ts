import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'

async function main() {
  const sql = neon(process.env.DATABASE_URL!)

  console.log('Agregando campos de dirección a Customer...')
  await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "street"     TEXT`
  await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "colonia"    TEXT`
  await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "postalCode" TEXT`
  await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "city"       TEXT`
  await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "state"      TEXT`
  await sql`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "phone"      TEXT`

  console.log('Creando tabla ShippingTier...')
  await sql`
    CREATE TABLE IF NOT EXISTS "ShippingTier" (
      "id"         TEXT NOT NULL,
      "label"      TEXT NOT NULL,
      "minKm"      DOUBLE PRECISION NOT NULL,
      "maxKm"      DOUBLE PRECISION,
      "fixedPrice" INTEGER,
      "basePrice"  INTEGER,
      "pricePerKm" INTEGER,
      "order"      INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT "ShippingTier_pkey" PRIMARY KEY ("id")
    )
  `

  console.log('Insertando tiers de ejemplo...')
  await sql`
    INSERT INTO "ShippingTier" ("id","label","minKm","maxKm","fixedPrice","order")
    VALUES
      (gen_random_uuid()::text, 'Envío local',     0,  15,  0,    0),
      (gen_random_uuid()::text, 'Envío regional',  15, 80,  8000, 1),
      (gen_random_uuid()::text, 'Envío nacional',  80, NULL, NULL, 2)
    ON CONFLICT DO NOTHING
  `

  await sql`
    UPDATE "ShippingTier" SET "basePrice"=5000, "pricePerKm"=200
    WHERE "label"='Envío nacional' AND "fixedPrice" IS NULL AND "basePrice" IS NULL
  `

  console.log('✅ Migración completada.')
}

main().catch(e => { console.error(e); process.exit(1) })
