import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("key")
  )
`
console.log('✅ SiteSettings table created')

await sql`
  INSERT INTO "_prisma_migrations" (
    id, checksum, finished_at, migration_name, logs,
    rolled_back_at, started_at, applied_steps_count
  ) VALUES (
    gen_random_uuid(),
    'add_site_settings',
    NOW(),
    '20260529000000_add_site_settings',
    NULL, NULL, NOW(), 1
  ) ON CONFLICT DO NOTHING
`
console.log('✅ Migration record inserted')
