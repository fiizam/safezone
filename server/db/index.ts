import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { initialReports, initialSafeHavens } from './mock-data'

const rawDatabaseUrl = process.env.DATABASE_URL || ''

// Verifikasi apakah URL Neon valid dan bukan placeholder
export const isDbConfigured = Boolean(
  rawDatabaseUrl &&
  !rawDatabaseUrl.includes('username:password') &&
  !rawDatabaseUrl.includes('ep-safezone-project') &&
  (rawDatabaseUrl.startsWith('postgresql://') || rawDatabaseUrl.startsWith('postgres://'))
)

let _db: ReturnType<typeof drizzle> | null = null

if (isDbConfigured) {
  try {
    const sql = neon(rawDatabaseUrl)
    _db = drizzle(sql, { schema })
    console.log('[SafeZone DB] Connected to Neon PostgreSQL via Drizzle ORM')
  } catch (error) {
    console.warn('[SafeZone DB] Failed to initialize Neon client, falling back to in-memory store:', error)
  }
} else {
  console.log('[SafeZone DB] Running in Fallback Mode with realistic demo data. Set DATABASE_URL in .env to connect to live Neon PostgreSQL.')
}

export const db = _db

// In-memory store fallback jika DATABASE_URL belum di-setup
let inMemoryReports = [...initialReports]
let inMemoryHavens = [...initialSafeHavens]

export const memoryStore = {
  getReports: () => [...inMemoryReports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  addReport: (newReport: Omit<schema.Report, 'id' | 'createdAt' | 'upvotes'>) => {
    const created: schema.Report = {
      ...newReport,
      id: inMemoryReports.length ? Math.max(...inMemoryReports.map(r => r.id)) + 1 : 1,
      upvotes: 1,
      createdAt: new Date()
    }
    inMemoryReports.unshift(created)
    return created
  },
  upvoteReport: (id: number) => {
    const item = inMemoryReports.find(r => r.id === id)
    if (item) {
      item.upvotes += 1
      return item
    }
    return null
  },
  getHavens: () => [...inMemoryHavens],
  addHaven: (newHaven: Omit<schema.SafeHaven, 'id'>) => {
    const created: schema.SafeHaven = {
      ...newHaven,
      id: inMemoryHavens.length ? Math.max(...inMemoryHavens.map(h => h.id)) + 1 : 1
    }
    inMemoryHavens.push(created)
    return created
  }
}
