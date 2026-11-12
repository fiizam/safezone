import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { initialReports, initialSafeHavens } from './mock-data'

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
        upvotes: report.upvotes,
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
