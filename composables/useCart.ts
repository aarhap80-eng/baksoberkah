import type { CartItem, MenuItem, OrderItemCustomization } from '~/types'

const STORAGE_KEY = 'bakso_berkah_cart_v1'

function buildCartKey(menuItemId: number, customization: OrderItemCustomization): string {
  return JSON.stringify([
    menuItemId,
    customization.noodleMix || '',
    customization.servingStyle || '',
    customization.spiceLevel || '',
    (customization.notes || '').trim().toLowerCase(),
  ])
}

export function useCart() {
  const items = useState<CartItem[]>('bakso_cart_items', () => [])
  const hydrated = useState<boolean>('bakso_cart_hydrated', () => false)

  function hydrateFromStorage() {
    if (import.meta.server || hydrated.value) return
    hydrated.value = true
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        items.value = parsed
      }
    } catch {
      // Ignore invalid storage data
    }
  }

  function persist() {
    if (import.meta.server) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // Ignore quota errors
    }
  }

  function addToCart(menuItem: MenuItem, quantity: number, customization: OrderItemCustomization) {
    const cleanCustom: OrderItemCustomization = {
      ...(customization.noodleMix ? { noodleMix: customization.noodleMix } : {}),
      ...(customization.servingStyle ? { servingStyle: customization.servingStyle } : {}),
      ...(customization.spiceLevel ? { spiceLevel: customization.spiceLevel } : {}),
      ...(customization.notes?.trim() ? { notes: customization.notes.trim() } : {}),
    }

    const key = buildCartKey(menuItem.id, cleanCustom)
    const existing = items.value.find(entry => entry.key === key)

    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + quantity)
      existing.menuItem = menuItem
    } else {
      items.value.push({
        key,
        menuItem,
        quantity: Math.max(1, Math.min(99, quantity)),
        customization: cleanCustom,
      })
    }

    persist()
  }

  function updateQuantity(key: string, delta: number) {
    const idx = items.value.findIndex(entry => entry.key === key)
    if (idx === -1) return
    const nextQty = items.value[idx].quantity + delta
    if (nextQty <= 0) {
      items.value.splice(idx, 1)
    } else {
      items.value[idx].quantity = Math.min(99, nextQty)
    }
    persist()
  }

  function removeFromCart(key: string) {
    items.value = items.value.filter(entry => entry.key !== key)
    persist()
  }

  function clearCart() {
    items.value = []
    persist()
  }

  function syncMenuCatalog(latestCatalog: MenuItem[]) {
    const map = new Map(latestCatalog.map(m => [m.id, m]))
    items.value = items.value
      .filter(entry => map.has(entry.menuItem.id))
      .map(entry => ({
        ...entry,
        menuItem: map.get(entry.menuItem.id)!,
      }))
    persist()
  }

  function getItemCountForMenu(menuItemId: number): number {
    return items.value
      .filter(entry => entry.menuItem.id === menuItemId)
      .reduce((sum, entry) => sum + entry.quantity, 0)
  }

  const totalItems = computed(() =>
    items.value.reduce((sum, entry) => sum + entry.quantity, 0),
  )

  const totalAmount = computed(() =>
    items.value.reduce((sum, entry) => sum + entry.menuItem.price * entry.quantity, 0),
  )

  return {
    items,
    totalItems,
    totalAmount,
    hydrateFromStorage,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncMenuCatalog,
    getItemCountForMenu,
  }
}
