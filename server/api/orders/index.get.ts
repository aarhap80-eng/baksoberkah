import { listOrders } from '../../db/repository'
import { requireAdminAuth } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const items = await listOrders()
  return { orders: items }
})
