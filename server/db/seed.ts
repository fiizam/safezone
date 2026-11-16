import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { initialReports, initialSafeHavens } from './mock-data'

function defaultHoursForCategory(category: string): string {
  if (category === 'begal') return '23:00 - 04:00 WIB'
  if (category === 'geng_motor') return '00:00 - 04:30 WIB'
  if (category === 'gelap') return '18:30 - 05:30 WIB'
  return '22:00 - 04:00 WIB'
}

async function runSeed() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl || databaseUrl.includes('username:password') || databaseUrl.includes('ep-safezone-project')) {
    console.error('Error: DATABASE_URL tidak valid di file .env.')
    process.exit(1)
  }

  console.log('Menghubungkan ke Neon PostgreSQL...')
  const sql = neon(databaseUrl)
  const db = drizzle(sql, { schema })

  try {
    await sql('ALTER TABLE reports ADD COLUMN IF NOT EXISTS resolved_count INTEGER NOT NULL DEFAULT 0')
    await sql('ALTER TABLE reports ADD COLUMN IF NOT EXISTS vulnerable_hours TEXT')
    await sql('ALTER TABLE reports ADD COLUMN IF NOT EXISTS photo_url TEXT')
    await sql('TRUNCATE TABLE reports, safe_havens RESTART IDENTITY CASCADE')

    for (const haven of initialSafeHavens) {
      await db.insert(schema.safeHavens).values({
        name: haven.name,
        type: haven.type,
        address: haven.address,
        latitude: haven.latitude,
        longitude: haven.longitude
      })
    }
    console.log(`Berhasil menyuntikkan ${initialSafeHavens.length} Safe Havens multi-kota.`)

    for (const report of initialReports) {
      await db.insert(schema.reports).values({
        title: report.title,
        description: report.description,
        category: report.category,
        dangerLevel: report.dangerLevel,
        latitude: report.latitude,
        longitude: report.longitude,
        vulnerableHours: report.vulnerableHours || defaultHoursForCategory(report.category),
        photoUrl: report.photoUrl || null,
        upvotes: report.upvotes,
        resolvedCount: report.resolvedCount || 0,
        createdAt: report.createdAt
      })
    }
    console.log(`Berhasil menyuntikkan ${initialReports.length} Laporan Bahaya multi-kota.`)
  } catch (error) {
    console.error('Gagal melakukan seeding database:', error)
    process.exit(1)
  }
}

runSeed()
