import { createError, getRouterParam, readBody } from 'h3'
import type { OrderStatus } from '../../../types'
import { updateOrderStatus } from '../../db/repository'
import { requireAdminAuth } from '../../utils/adminAuth'

const VALID_STATUSES: OrderStatus[] = ['pending', 'preparing', 'completed', 'cancelled']

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID pesanan tidak valid.' })
  }

  const body = await readBody(event)
  const status = String(body?.status || '').trim() as OrderStatus

  if (!VALID_STATUSES.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status pesanan tidak valid.' })
  }

  const updated = await updateOrderStatus(id, status)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan.' })
  }

  return { order: updated }
})
