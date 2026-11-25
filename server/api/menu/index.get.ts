import { getQuery } from 'h3'
import { listMenuItems } from '../../db/repository'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category.trim().toLowerCase() : ''
  const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''

  let items = await listMenuItems()

  if (category && category !== 'semua' && category !== 'all') {
    items = items.filter(item => item.category === category)
  }

  if (q) {
    items = items.filter(
      item =>
        item.name.toLowerCase().includes(q)
        || item.description.toLowerCase().includes(q),
    )
  }

  return { items }
})
