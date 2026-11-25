import { createError, readBody } from 'h3'
import { updateStoreSettings } from '../db/repository'
import { requireAdminAuth } from '../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Data pengaturan warung tidak valid.' })
  }

  if (body.store_name !== undefined && !String(body.store_name).trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama warung tidak boleh kosong.' })
  }

  const updated = await updateStoreSettings({
    store_name: body.store_name,
    tagline: body.tagline,
    is_open: body.is_open,
    whatsapp_number: body.whatsapp_number,
    address: body.address,
    open_hours: body.open_hours,
    maps_url: body.maps_url,
    maps_embed_url: body.maps_embed_url,
  })

  return { store: updated }
})
