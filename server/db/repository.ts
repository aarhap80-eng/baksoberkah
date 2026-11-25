import { desc, eq } from 'drizzle-orm'
import type { MenuCategory, MenuItem, OrderItem, OrderRecord, OrderStatus, OrderType, StoreSettings } from '../../types'
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from './index'
import { menuItems, orders, storeSettings } from './schema'
import { INITIAL_MENU_ITEMS, INITIAL_STORE_SETTINGS } from './seed-data'

/**
 * In-memory fallback store used ONLY when DATABASE_URL / TIDB_HOST is not configured yet.
 * As soon as TiDB Cloud credentials are provided in .env, all reads & writes go directly to TiDB Cloud via Drizzle ORM.
 */
interface MemoryStore {
  store: StoreSettings
  menu: MenuItem[]
  nextMenuId: number
  orders: OrderRecord[]
}

const memoryStore: MemoryStore = {
  store: { ...INITIAL_STORE_SETTINGS },
  menu: INITIAL_MENU_ITEMS.map((item, idx) => ({
    id: idx + 1,
    ...item,
  })),
  nextMenuId: INITIAL_MENU_ITEMS.length + 1,
  orders: [],
}

function normalizeStoreRow(row: typeof storeSettings.$inferSelect): StoreSettings {
  return {
    id: row.id,
    store_name: row.store_name,
    tagline: row.tagline,
    is_open: Boolean(row.is_open),
    whatsapp_number: row.whatsapp_number,
    address: row.address,
    open_hours: row.open_hours,
    maps_url: row.maps_url ?? null,
    maps_embed_url: row.maps_embed_url ?? null,
  }
}

function normalizeMenuRow(row: typeof menuItems.$inferSelect): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as MenuCategory,
    description: row.description,
    price: Number(row.price),
    image_url: row.image_url,
    is_available: Boolean(row.is_available),
    is_bestseller: Boolean(row.is_bestseller),
  }
}

function normalizeOrderRow(row: typeof orders.$inferSelect): OrderRecord {
  const parsedItems = typeof row.items_json === 'string'
    ? (JSON.parse(row.items_json) as OrderItem[])
    : (row.items_json as OrderItem[])

  return {
    id: row.id,
    order_code: row.order_code,
    customer_name: row.customer_name,
    customer_phone: row.customer_phone ?? null,
    order_type: row.order_type as OrderType,
    table_number: row.table_number ?? null,
    delivery_address: row.delivery_address ?? null,
    items_json: parsedItems,
    total_amount: Number(row.total_amount),
    status: row.status as OrderStatus,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }
}

export function getDbMode(): 'tidb' | 'memory' {
  return isDatabaseConfigured() ? 'tidb' : 'memory'
}

// --- Store Settings ---
export async function getStoreSettings(): Promise<StoreSettings> {
  if (!isDatabaseConfigured()) {
    return { ...memoryStore.store }
  }

  await ensureDatabaseReady()
  const db = getDb()
  const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1)
  if (rows.length === 0) {
    return { ...INITIAL_STORE_SETTINGS }
  }
  return normalizeStoreRow(rows[0])
}

export async function updateStoreSettings(patch: Partial<Omit<StoreSettings, 'id'>>): Promise<StoreSettings> {
  const cleanPatch: Partial<Omit<StoreSettings, 'id'>> = {
    ...(patch.store_name !== undefined && { store_name: patch.store_name.trim() }),
    ...(patch.tagline !== undefined && { tagline: patch.tagline.trim() }),
    ...(patch.is_open !== undefined && { is_open: Boolean(patch.is_open) }),
    ...(patch.whatsapp_number !== undefined && { whatsapp_number: patch.whatsapp_number.replace(/[^\d]/g, '') }),
    ...(patch.address !== undefined && { address: patch.address.trim() }),
    ...(patch.open_hours !== undefined && { open_hours: patch.open_hours.trim() }),
    ...(patch.maps_url !== undefined && { maps_url: patch.maps_url?.trim() || null }),
    ...(patch.maps_embed_url !== undefined && { maps_embed_url: patch.maps_embed_url?.trim() || null }),
  }

  if (!isDatabaseConfigured()) {
    memoryStore.store = { ...memoryStore.store, ...cleanPatch }
    return { ...memoryStore.store }
  }

  await ensureDatabaseReady()
  const db = getDb()
  await db.update(storeSettings).set(cleanPatch).where(eq(storeSettings.id, 1))
  return getStoreSettings()
}

// --- Menu Items ---
export async function listMenuItems(): Promise<MenuItem[]> {
  if (!isDatabaseConfigured()) {
    return memoryStore.menu.map(item => ({ ...item }))
  }

  await ensureDatabaseReady()
  const db = getDb()
  const rows = await db.select().from(menuItems)
  return rows.map(normalizeMenuRow)
}

export async function getMenuItemById(id: number): Promise<MenuItem | null> {
  if (!isDatabaseConfigured()) {
    const found = memoryStore.menu.find(m => m.id === id)
    return found ? { ...found } : null
  }

  await ensureDatabaseReady()
  const db = getDb()
  const rows = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1)
  return rows[0] ? normalizeMenuRow(rows[0]) : null
}

export interface CreateMenuItemInput {
  name: string
  category: MenuCategory
  description: string
  price: number
  image_url: string
  is_available?: boolean
  is_bestseller?: boolean
}

export async function createMenuItem(input: CreateMenuItemInput): Promise<MenuItem> {
  const payload = {
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    price: Math.max(0, Math.round(Number(input.price))),
    image_url: input.image_url.trim() || '/images/menu/bakso-urat.jpg',
    is_available: input.is_available ?? true,
    is_bestseller: input.is_bestseller ?? false,
  }

  if (!isDatabaseConfigured()) {
    const created: MenuItem = { id: memoryStore.nextMenuId++, ...payload }
    memoryStore.menu.push(created)
    return { ...created }
  }

  await ensureDatabaseReady()
  const db = getDb()
  const [result] = await db.insert(menuItems).values(payload)
  const insertId = Number((result as { insertId?: number }).insertId)
  if (insertId) {
    const fetched = await getMenuItemById(insertId)
    if (fetched) return fetched
  }
  const all = await listMenuItems()
  return all[all.length - 1]
}

export async function updateMenuItem(id: number, patch: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem | null> {
  const cleanPatch: Partial<Omit<MenuItem, 'id'>> = {
    ...(patch.name !== undefined && { name: patch.name.trim() }),
    ...(patch.category !== undefined && { category: patch.category }),
    ...(patch.description !== undefined && { description: patch.description.trim() }),
    ...(patch.price !== undefined && { price: Math.max(0, Math.round(Number(patch.price))) }),
    ...(patch.image_url !== undefined && { image_url: patch.image_url.trim() || '/images/menu/bakso-urat.jpg' }),
    ...(patch.is_available !== undefined && { is_available: Boolean(patch.is_available) }),
    ...(patch.is_bestseller !== undefined && { is_bestseller: Boolean(patch.is_bestseller) }),
  }

  if (!isDatabaseConfigured()) {
    const idx = memoryStore.menu.findIndex(m => m.id === id)
    if (idx === -1) return null
    memoryStore.menu[idx] = { ...memoryStore.menu[idx], ...cleanPatch }
    return { ...memoryStore.menu[idx] }
  }

  await ensureDatabaseReady()
  const db = getDb()
  await db.update(menuItems).set(cleanPatch).where(eq(menuItems.id, id))
  return getMenuItemById(id)
}

export async function deleteMenuItem(id: number): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    const prevLen = memoryStore.menu.length
    memoryStore.menu = memoryStore.menu.filter(m => m.id !== id)
    return memoryStore.menu.length < prevLen
  }

  await ensureDatabaseReady()
  const db = getDb()
  const existing = await getMenuItemById(id)
  if (!existing) return false
  await db.delete(menuItems).where(eq(menuItems.id, id))
  return true
}

// --- Orders ---
export interface CreateOrderInput {
  id: string
  order_code: string
  customer_name: string
  customer_phone: string | null
  order_type: OrderType
  table_number: string | null
  delivery_address: string | null
  items_json: OrderItem[]
  total_amount: number
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  if (!isDatabaseConfigured()) {
    const created: OrderRecord = {
      ...input,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    memoryStore.orders.unshift(created)
    return { ...created }
  }

  await ensureDatabaseReady()
  const db = getDb()
  await db.insert(orders).values({
    id: input.id,
    order_code: input.order_code,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    order_type: input.order_type,
    table_number: input.table_number,
    delivery_address: input.delivery_address,
    items_json: input.items_json,
    total_amount: input.total_amount,
    status: 'pending',
  })

  const rows = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1)
  return normalizeOrderRow(rows[0])
}

export async function listOrders(): Promise<OrderRecord[]> {
  if (!isDatabaseConfigured()) {
    return memoryStore.orders.map(o => ({ ...o }))
  }

  await ensureDatabaseReady()
  const db = getDb()
  const rows = await db.select().from(orders).orderBy(desc(orders.created_at))
  return rows.map(normalizeOrderRow)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<OrderRecord | null> {
  if (!isDatabaseConfigured()) {
    const found = memoryStore.orders.find(o => o.id === id)
    if (!found) return null
    found.status = status
    return { ...found }
  }

  await ensureDatabaseReady()
  const db = getDb()
  await db.update(orders).set({ status }).where(eq(orders.id, id))
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  return rows[0] ? normalizeOrderRow(rows[0]) : null
}
