import crypto from 'node:crypto'
import { createError, readBody } from 'h3'
import type { OrderItem, OrderType } from '../../../types'
import { createOrder, getStoreSettings, listMenuItems } from '../../db/repository'
import { buildWhatsAppOrderUrl } from '../../utils/whatsapp'

const VALID_ORDER_TYPES: OrderType[] = ['dine_in', 'takeaway', 'delivery']

function generateOrderCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  const bytes = crypto.randomBytes(5)
  for (let i = 0; i < 5; i++) {
    suffix += chars[bytes[i] % chars.length]
  }
  return `BB-${suffix}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const store = await getStoreSettings()

  if (!store.is_open) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Maaf, warung sedang tutup sementara dan belum bisa menerima pesanan.',
    })
  }

  const customerName = String(body?.customer_name || '').trim()
  const customerPhone = String(body?.customer_phone || '').trim() || null
  const orderType = String(body?.order_type || '').trim() as OrderType
  const tableNumber = String(body?.table_number || '').trim() || null
  const deliveryAddress = String(body?.delivery_address || '').trim() || null
  const rawItems = Array.isArray(body?.items) ? body.items : []

  if (!customerName) {
    throw createError({ statusCode: 400, statusMessage: 'Nama pemesan wajib diisi.' })
  }

  if (!VALID_ORDER_TYPES.includes(orderType)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe pesanan tidak valid.' })
  }

  if (orderType === 'dine_in' && !tableNumber) {
    throw createError({ statusCode: 400, statusMessage: 'Mohon isi nomor meja untuk makan di tempat.' })
  }

  if (orderType === 'delivery' && !deliveryAddress) {
    throw createError({ statusCode: 400, statusMessage: 'Mohon isi alamat lengkap untuk pesan antar.' })
  }

  if (rawItems.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Keranjang pesanan masih kosong.' })
  }

  const menuCatalog = await listMenuItems()
  const menuById = new Map(menuCatalog.map(item => [item.id, item]))

  const verifiedItems: OrderItem[] = []
  let totalAmount = 0

  for (const raw of rawItems) {
    const menuId = Number(raw?.menu_item_id)
    const quantity = Math.max(1, Math.min(99, Math.floor(Number(raw?.quantity) || 0)))
    const catalogItem = menuById.get(menuId)

    if (!catalogItem) {
      throw createError({ statusCode: 400, statusMessage: 'Salah satu menu di keranjang tidak ditemukan.' })
    }

    if (!catalogItem.is_available) {
      throw createError({
        statusCode: 400,
        statusMessage: `Maaf, menu "${catalogItem.name}" sedang habis.`,
      })
    }

    const subtotal = catalogItem.price * quantity
    totalAmount += subtotal

    const customization = raw?.customization && typeof raw.customization === 'object'
      ? {
          ...(raw.customization.noodleMix ? { noodleMix: String(raw.customization.noodleMix).trim().slice(0, 60) } : {}),
          ...(raw.customization.servingStyle ? { servingStyle: String(raw.customization.servingStyle).trim().slice(0, 40) } : {}),
          ...(raw.customization.spiceLevel ? { spiceLevel: String(raw.customization.spiceLevel).trim().slice(0, 40) } : {}),
          ...(raw.customization.notes ? { notes: String(raw.customization.notes).trim().slice(0, 200) } : {}),
        }
      : {}

    verifiedItems.push({
      menu_item_id: catalogItem.id,
      name: catalogItem.name,
      category: catalogItem.category,
      unit_price: catalogItem.price,
      quantity,
      subtotal,
      customization,
    })
  }

  const order = await createOrder({
    id: crypto.randomUUID(),
    order_code: generateOrderCode(),
    customer_name: customerName,
    customer_phone: customerPhone,
    order_type: orderType,
    table_number: orderType === 'dine_in' ? tableNumber : null,
    delivery_address: orderType === 'delivery' ? deliveryAddress : null,
    items_json: verifiedItems,
    total_amount: totalAmount,
  })

  const whatsappUrl = buildWhatsAppOrderUrl(store, order)

  return {
    order,
    whatsappUrl,
  }
})
