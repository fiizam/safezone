import { db, memoryStore } from '~/server/db'
import * as schema from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data Safe Haven tidak valid'
    })
  }

  const { name, type, address, latitude, longitude } = body

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama lokasi minimal 3 karakter'
    })
  }

  const validTypes = ['minimarket_24h', 'spbu', 'pos_polisi']
  if (!validTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tipe harus salah satu dari: ${validTypes.join(', ')}`
    })
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Alamat minimal 5 karakter'
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
    let createdHaven: schema.SafeHaven

    if (db) {
      try {
        const [inserted] = await db.insert(schema.safeHavens).values({
          name: name.trim(),
          type,
          address: address.trim(),
          latitude: latNum,
          longitude: lngNum
        }).returning()

        createdHaven = inserted
      } catch (dbErr) {
        console.warn('[API Havens POST] Database insert failed, using memory fallback:', dbErr)
        createdHaven = memoryStore.addHaven({
          name: name.trim(),
          type,
          address: address.trim(),
          latitude: latNum,
          longitude: lngNum
        })
      }
    } else {
      createdHaven = memoryStore.addHaven({
        name: name.trim(),
        type,
        address: address.trim(),
        latitude: latNum,
        longitude: lngNum
      })
    }

    setResponseStatus(event, 201)
    return {
      success: true,
      message: 'Safe Haven berhasil ditambahkan',
      data: createdHaven
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Gagal menyimpan Safe Haven'
    })
  }
})

