import { pgTable, serial, text, doublePrecision, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'

export const reportCategoryEnum = pgEnum('report_category', ['gelap', 'begal', 'geng_motor', 'sepi'])
export const dangerLevelEnum = pgEnum('danger_level', ['low', 'medium', 'high'])
export const havenTypeEnum = pgEnum('haven_type', ['minimarket_24h', 'spbu', 'pos_polisi'])

// Tabel Laporan Titik Bahaya / Kejahatan Jalanan
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'gelap' | 'begal' | 'geng_motor' | 'sepi'
  dangerLevel: text('danger_level').notNull(), // 'low' | 'medium' | 'high'
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  upvotes: integer('upvotes').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Tabel Titik Aman / Safe Havens (Pos Polisi, SPBU, Minimarket 24 Jam)
export const safeHavens = pgTable('safe_havens', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'minimarket_24h' | 'spbu' | 'pos_polisi'
  address: text('address').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull()
})

export type Report = InferSelectModel<typeof reports>
export type NewReport = InferInsertModel<typeof reports>

export type SafeHaven = InferSelectModel<typeof safeHavens>
export type NewSafeHaven = InferInsertModel<typeof safeHavens>

export type ReportCategory = 'gelap' | 'begal' | 'geng_motor' | 'sepi'
export type DangerLevel = 'low' | 'medium' | 'high'
export type HavenType = 'minimarket_24h' | 'spbu' | 'pos_polisi'
