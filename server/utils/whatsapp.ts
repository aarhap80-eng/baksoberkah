import type { OrderRecord, OrderType, StoreSettings } from '../../types'

export function formatRupiahServer(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`
}

export function getOrderTypeLabel(type: OrderType): string {
  switch (type) {
    case 'dine_in':
      return 'Makan di Tempat'
    case 'takeaway':
      return 'Bungkus / Ambil Sendiri'
    case 'delivery':
      return 'Pesan Antar'
  }
}

export function buildWhatsAppOrderUrl(store: StoreSettings, order: OrderRecord): string {
  const cleanPhone = (store.whatsapp_number || '6281234567890').replace(/[^\d]/g, '')
  const lines: string[] = [
    `Halo *${store.store_name}*! Saya mau pesan ya:`,
    '',
    `*Kode Pesanan:* ${order.order_code}`,
    `*Nama:* ${order.customer_name}`,
  ]

  if (order.customer_phone) {
    lines.push(`*No. HP:* ${order.customer_phone}`)
  }

  if (order.order_type === 'dine_in') {
    const meja = order.table_number ? ` (Meja ${order.table_number})` : ''
    lines.push(`*Tipe:* Makan di Tempat${meja}`)
  } else if (order.order_type === 'takeaway') {
    lines.push('*Tipe:* Bungkus / Ambil Sendiri')
  } else {
    lines.push('*Tipe:* Pesan Antar')
    if (order.delivery_address) {
      lines.push(`*Alamat Antar:* ${order.delivery_address}`)
    }
  }

  lines.push('', '*Rincian Pesanan:*')

  order.items_json.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} x${item.quantity} — ${formatRupiahServer(item.subtotal)}`)
    const details: string[] = []
    if (item.customization.noodleMix) details.push(`Mie: ${item.customization.noodleMix}`)
    if (item.customization.servingStyle) details.push(`Penyajian: ${item.customization.servingStyle}`)
    if (item.customization.spiceLevel) details.push(`Pedas: ${item.customization.spiceLevel}`)
    if (item.customization.notes) details.push(`Catatan: ${item.customization.notes}`)
    if (details.length > 0) {
      lines.push(`   _${details.join(' | ')}_`)
    }
  })

  lines.push('', `*Total Pembayaran:* ${formatRupiahServer(order.total_amount)}`, '', 'Terima kasih banyak! 🙏')

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`
}
