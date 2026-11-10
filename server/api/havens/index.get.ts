import { db, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const typeFilter = query.type as string | undefined

  try {
    let havensList: schema.SafeHaven[] = []

    if (db) {
      try {
        havensList = await db.select().from(schema.safeHavens)
      } catch (dbErr) {
        console.warn('[API Havens GET] Database query failed, using memory fallback:', dbErr)
        havensList = memoryStore.getHavens()
      }
    } else {
      havensList = memoryStore.getHavens()
    }

    if (typeFilter && typeFilter !== 'all') {
      havensList = havensList.filter(h => h.type === typeFilter)
    }

    return {
      success: true,
      count: havensList.length,
      data: havensList
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal memuat data Safe Havens'
    })
  }
})
