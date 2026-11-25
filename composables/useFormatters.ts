import type { MenuCategory, OrderStatus, OrderType } from '~/types'

export function useFormatters() {
  function formatRupiah(amount: number): string {
    return `Rp ${Math.round(Number(amount) || 0).toLocaleString('id-ID')}`
  }

  function formatOrderTime(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date) + ' WIB'
  }

  function getCategoryLabel(category: MenuCategory): string {
    switch (category) {
      case 'bakso':
        return 'Bakso'
      case 'mie':
        return 'Mie & Kwetiau'
      case 'nasi':
        return 'Nasi'
      case 'minuman':
        return 'Minuman'
    }
  }

  function getOrderTypeLabel(type: OrderType): string {
    switch (type) {
      case 'dine_in':
        return 'Makan di Tempat'
      case 'takeaway':
        return 'Bungkus / Ambil Sendiri'
      case 'delivery':
        return 'Pesan Antar'
    }
  }

  function getOrderStatusInfo(status: OrderStatus): { label: string; badgeClass: string; dotClass: string } {
    switch (status) {
      case 'pending':
        return {
          label: 'Menunggu',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500',
        }
      case 'preparing':
        return {
          label: 'Dimasak',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          dotClass: 'bg-blue-500',
        }
      case 'completed':
        return {
          label: 'Selesai',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-500',
        }
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          badgeClass: 'bg-stone-200 text-stone-700 border-stone-300',
          dotClass: 'bg-stone-500',
        }
    }
  }

  return {
    formatRupiah,
    formatOrderTime,
    getCategoryLabel,
    getOrderTypeLabel,
    getOrderStatusInfo,
  }
}
