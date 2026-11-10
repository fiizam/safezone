import { eq, sql } from 'drizzle-orm'
import { db, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const reportId = parseInt(idParam || '', 10)

  if (isNaN(reportId) || reportId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID Laporan tidak valid'
    })
  }

  try {
    let updatedReport: schema.Report | null = null

    if (db) {
      try {
        const [updated] = await db
          .update(schema.reports)
          .set({ upvotes: sql`${schema.reports.upvotes} + 1` })
          .where(eq(schema.reports.id, reportId))
          .returning()

        updatedReport = updated || null
      } catch (dbErr) {
        console.warn('[API Upvote POST] Database update failed, using memory fallback:', dbErr)
        updatedReport = memoryStore.upvoteReport(reportId)
      }
    } else {
      updatedReport = memoryStore.upvoteReport(reportId)
    }

    if (!updatedReport) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Laporan tidak ditemukan'
      })
    }

    return {
      success: true,
      message: 'Validasi / Upvote berhasil ditambahkan',
      data: updatedReport
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal menambahkan upvote'
    })
  }
})
