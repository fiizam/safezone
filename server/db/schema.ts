import { pgTable, serial, text, doublePrecision, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'

export const reportCategoryEnum = pgEnum('report_category', ['gelap', 'begal', 'geng_motor', 'sepi'])
export const dangerLevelEnum = pgEnum('danger_level', ['low', 'medium', 'high'])
export const havenTypeEnum = pgEnum('haven_type', ['minimarket_24h', 'spbu', 'pos_polisi'])

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  dangerLevel: text('danger_level').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  upvotes: integer('upvotes').default(1).notNull(),
  resolvedCount: integer('resolved_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const safeHavens = pgTable('safe_havens', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
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
