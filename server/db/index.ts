import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { initialReports, initialSafeHavens } from './mock-data'

let _db: ReturnType<typeof drizzle> | null = null
let _initializedUrl = ''

export function getDb() {
  let rawDatabaseUrl = process.env.DATABASE_URL || ''
  try {
    const config = useRuntimeConfig()
    if (config?.databaseUrl) {
      rawDatabaseUrl = String(config.databaseUrl)
    }
  } catch {
    // Fallback to process.env outside Nitro request context
  }

  rawDatabaseUrl = rawDatabaseUrl.trim()

  const isValidUrl = Boolean(
    rawDatabaseUrl &&
    !rawDatabaseUrl.includes('username:password') &&
    !rawDatabaseUrl.includes('ep-safezone-project') &&
    (rawDatabaseUrl.startsWith('postgresql://') || rawDatabaseUrl.startsWith('postgres://'))
  )

  if (!isValidUrl) {
    return null
  }

  if (_db && _initializedUrl === rawDatabaseUrl) {
    return _db
  }

  try {
    const sql = neon(rawDatabaseUrl)
    _db = drizzle(sql, { schema })
    _initializedUrl = rawDatabaseUrl
    return _db
  } catch (error) {
    console.warn('[SafeZone DB] Failed to initialize Neon client, falling back to in-memory store:', error)
    return null
  }
}

export const db = getDb()

let inMemoryReports = [...initialReports]
let inMemoryHavens = [...initialSafeHavens]

export const memoryStore = {
  getReports: () => [...inMemoryReports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  addReport: (newReport: Omit<schema.Report, 'id' | 'createdAt' | 'upvotes' | 'resolvedCount'>) => {
    const created: schema.Report = {
      ...newReport,
      id: inMemoryReports.length ? Math.max(...inMemoryReports.map(r => r.id)) + 1 : 1,
      upvotes: 1,
      resolvedCount: 0,
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
  resolveReport: (id: number) => {
    const item = inMemoryReports.find(r => r.id === id)
    if (item) {
      item.resolvedCount = (item.resolvedCount || 0) + 1
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
