import { createError, readBody } from 'h3'
import type { MenuCategory } from '../../../types'
import { createMenuItem } from '../../db/repository'
import { requireAdminAuth } from '../../utils/adminAuth'

const VALID_CATEGORIES: MenuCategory[] = ['bakso', 'mie', 'nasi', 'minuman']

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const category = String(body?.category || '').trim() as MenuCategory
  const description = String(body?.description || '').trim()
  const price = Number(body?.price)
  const image_url = String(body?.image_url || '').trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Nama menu wajib diisi.' })
  }
  if (!VALID_CATEGORIES.includes(category)) {
    throw createError({ statusCode: 400, statusMessage: 'Kategori menu tidak valid.' })
  }
  if (!Number.isFinite(price) || price < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Harga menu harus berupa angka yang valid.' })
  }

  const item = await createMenuItem({
    name,
    category,
    description: description || 'Hidangan spesial Bakso Berkah',
    price,
    image_url: image_url || '/images/menu/bakso-urat.jpg',
    is_available: body?.is_available !== undefined ? Boolean(body.is_available) : true,
    is_bestseller: body?.is_bestseller !== undefined ? Boolean(body.is_bestseller) : false,
  })

  return { item }
})
