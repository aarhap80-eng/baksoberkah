import { createError, getRouterParam, readBody } from 'h3'
import type { MenuCategory } from '../../../types'
import { updateMenuItem } from '../../db/repository'
import { requireAdminAuth } from '../../utils/adminAuth'

const VALID_CATEGORIES: MenuCategory[] = ['bakso', 'mie', 'nasi', 'minuman']

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID menu tidak valid.' })
  }

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Data pembaruan menu tidak valid.' })
  }

  if (body.category !== undefined && !VALID_CATEGORIES.includes(body.category)) {
    throw createError({ statusCode: 400, statusMessage: 'Kategori menu tidak valid.' })
  }

  if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) {
    throw createError({ statusCode: 400, statusMessage: 'Harga menu tidak valid.' })
  }

  const updated = await updateMenuItem(id, {
    name: body.name,
    category: body.category,
    description: body.description,
    price: body.price,
    image_url: body.image_url,
    is_available: body.is_available,
    is_bestseller: body.is_bestseller,
  })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Menu tidak ditemukan.' })
  }

  return { item: updated }
})
