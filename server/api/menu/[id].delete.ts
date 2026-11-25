import { createError, getRouterParam } from 'h3'
import { deleteMenuItem } from '../../db/repository'
import { requireAdminAuth } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'ID menu tidak valid.' })
  }

  const deleted = await deleteMenuItem(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Menu tidak ditemukan.' })
  }

  return { deleted: true }
})
