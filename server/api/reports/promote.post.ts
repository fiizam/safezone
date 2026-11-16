import { and, gte, lte, sql, eq } from 'drizzle-orm'
import { getDb, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payload sinkronisasi radar tidak valid'
    })
  }

  const {
    title,
    description,
    category,
    dangerLevel,
    latitude,
    longitude,
    vulnerableHours,
    upvotes = 1,
    resolvedCount = 0,
    action = 'upvote'
  } = body

  const latNum = parseFloat(latitude)
  const lngNum = parseFloat(longitude)

  if (!title || !description || isNaN(latNum) || isNaN(lngNum)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data koordinat atau judul titik radar tidak lengkap'
    })
  }

  const validCategories = ['gelap', 'begal', 'geng_motor', 'sepi']
  const safeCat = validCategories.includes(category) ? category : 'gelap'
  const validLevels = ['low', 'medium', 'high']
  const safeLevel = validLevels.includes(dangerLevel) ? dangerLevel : 'medium'
  const cleanHours =
    typeof vulnerableHours === 'string' && vulnerableHours.trim()
      ? vulnerableHours.trim().slice(0, 64)
      : safeCat === 'begal'
        ? '23:00 - 04:00 WIB'
        : safeCat === 'geng_motor'
          ? '00:00 - 04:30 WIB'
          : '19:00 - 05:00 WIB'

  const deltaCoord = 0.00085 // ~90m tolerance

  try {
    const db = getDb()
    if (db) {
      try {
        const existingRows = await db
          .select()
          .from(schema.reports)
          .where(
            and(
              gte(schema.reports.latitude, latNum - deltaCoord),
              lte(schema.reports.latitude, latNum + deltaCoord),
              gte(schema.reports.longitude, lngNum - deltaCoord),
              lte(schema.reports.longitude, lngNum + deltaCoord)
            )
          )
          .limit(1)

        if (existingRows.length > 0) {
          const existing = existingRows[0]
          const [updated] = await db
            .update(schema.reports)
            .set(
              action === 'resolve'
                ? { resolvedCount: sql`${schema.reports.resolvedCount} + 1` }
                : { upvotes: sql`${schema.reports.upvotes} + 1` }
            )
            .where(eq(schema.reports.id, existing.id))
            .returning()

          return {
            success: true,
            promoted: false,
            merged: true,
            data: updated
          }
        }

        const initialUpvotes = Math.max(1, Number(upvotes) || 1)
        const initialResolved = Math.max(0, Number(resolvedCount) || 0)

        const [inserted] = await db
          .insert(schema.reports)
          .values({
            title: String(title).trim(),
            description: String(description).trim(),
            category: safeCat,
            dangerLevel: safeLevel,
            latitude: latNum,
            longitude: lngNum,
            vulnerableHours: cleanHours,
            photoUrl: null,
            upvotes: initialUpvotes,
            resolvedCount: initialResolved,
            createdAt: new Date()
          })
          .returning()

        return {
          success: true,
          promoted: true,
          merged: false,
          data: inserted
        }
      } catch (dbErr) {
        console.warn('[API Reports Promote] DB error, using memoryStore:', dbErr)
      }
    }

    const memCreated = memoryStore.addReport({
      title: String(title).trim(),
      description: String(description).trim(),
      category: safeCat,
      dangerLevel: safeLevel,
      latitude: latNum,
      longitude: lngNum,
      vulnerableHours: cleanHours,
      photoUrl: null
    })
    memCreated.upvotes = Math.max(1, Number(upvotes) || 1)
    memCreated.resolvedCount = Math.max(0, Number(resolvedCount) || 0)

    return {
      success: true,
      promoted: true,
      merged: false,
      data: memCreated
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Gagal menyinkronkan titik radar ke database'
    })
  }
})
