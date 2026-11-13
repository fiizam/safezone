import { db, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data laporan tidak valid'
    })
  }

  const { title, description, category, dangerLevel, latitude, longitude } = body

  // Validasi input
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Judul laporan minimal 3 karakter'
    })
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Deskripsi kejadian/kondisi minimal 5 karakter'
    })
  }

  const validCategories = ['gelap', 'begal', 'geng_motor', 'sepi']
  if (!validCategories.includes(category)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kategori harus salah satu dari: ${validCategories.join(', ')}`
    })
  }

  const validDangerLevels = ['low', 'medium', 'high']
  if (!validDangerLevels.includes(dangerLevel)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tingkat bahaya harus salah satu dari: ${validDangerLevels.join(', ')}`
    })
  }

  const latNum = parseFloat(latitude)
  const lngNum = parseFloat(longitude)

  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude tidak valid'
    })
  }

  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Longitude tidak valid'
    })
  }

  try {
    let createdReport: schema.Report

    if (db) {
      try {
        const [inserted] = await db.insert(schema.reports).values({
          title: title.trim(),
          description: description.trim(),
          category,
          dangerLevel,
          latitude: latNum,
          longitude: lngNum,
          upvotes: 1,
          resolvedCount: 0,
          createdAt: new Date()
        }).returning()

        createdReport = inserted
      } catch (dbErr) {
        console.warn('[API Reports POST] Database insert failed, using memory fallback:', dbErr)
        createdReport = memoryStore.addReport({
          title: title.trim(),
          description: description.trim(),
          category,
          dangerLevel,
          latitude: latNum,
          longitude: lngNum
        })
      }
    } else {
      createdReport = memoryStore.addReport({
        title: title.trim(),
        description: description.trim(),
        category,
        dangerLevel,
        latitude: latNum,
        longitude: lngNum
      })
    }

    setResponseStatus(event, 201)
    return {
      success: true,
      message: 'Laporan berhasil ditambahkan ke SafeZone',
      data: createdReport
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal menyimpan laporan'
    })
  }
})

