import { desc, eq } from 'drizzle-orm'
import { db, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categoryFilter = query.category as string | undefined
  const dangerFilter = query.dangerLevel as string | undefined

  try {
    let reportsList: schema.Report[] = []

    if (db) {
      try {
        const queryBuilder = db.select().from(schema.reports).orderBy(desc(schema.reports.createdAt))
        reportsList = await queryBuilder
      } catch (dbErr) {
        console.warn('[API Reports GET] Database query failed, using memory fallback:', dbErr)
        reportsList = memoryStore.getReports()
      }
    } else {
      reportsList = memoryStore.getReports()
    }

    // Apply filters if provided
    if (categoryFilter && categoryFilter !== 'all') {
      reportsList = reportsList.filter(r => r.category === categoryFilter)
    }

    if (dangerFilter && dangerFilter !== 'all') {
      reportsList = reportsList.filter(r => r.dangerLevel === dangerFilter)
    }

    return {
      success: true,
      count: reportsList.length,
      data: reportsList
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal memuat daftar laporan rawan'
    })
  }
})

