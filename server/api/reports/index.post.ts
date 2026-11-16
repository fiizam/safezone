import { getDb, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data laporan tidak valid'
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
    photoUrl
  } = body

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

  const cleanHours =
    typeof vulnerableHours === 'string' && vulnerableHours.trim().length > 0
      ? vulnerableHours.trim().slice(0, 64)
      : null

  const cleanPhotoUrl =
    typeof photoUrl === 'string' &&
    (photoUrl.startsWith('data:image/') || photoUrl.startsWith('https://')) &&
    photoUrl.length <= 450000
      ? photoUrl
      : null

  try {
    let createdReport: schema.Report
    const db = getDb()

    if (db) {
      try {
        const [inserted] = await db.insert(schema.reports).values({
          title: title.trim(),
          description: description.trim(),
          category,
          dangerLevel,
          latitude: latNum,
          longitude: lngNum,
          vulnerableHours: cleanHours,
          photoUrl: cleanPhotoUrl,
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
          longitude: lngNum,
          vulnerableHours: cleanHours,
          photoUrl: cleanPhotoUrl
        })
      }
    } else {
      createdReport = memoryStore.addReport({
        title: title.trim(),
        description: description.trim(),
        category,
        dangerLevel,
        latitude: latNum,
        longitude: lngNum,
        vulnerableHours: cleanHours,
        photoUrl: cleanPhotoUrl
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
