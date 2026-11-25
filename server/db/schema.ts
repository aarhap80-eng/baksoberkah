import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core'
import type { OrderItem } from '../../types'

export const storeSettings = mysqlTable('store_settings', {
  id: int('id').primaryKey().default(1),
  store_name: varchar('store_name', { length: 150 }).notNull().default('Bakso Berkah'),
  tagline: varchar('tagline', { length: 255 }).notNull().default('Gurih Kuahnya, Mantap Dagingnya'),
  is_open: boolean('is_open').notNull().default(true),
  whatsapp_number: varchar('whatsapp_number', { length: 30 }).notNull().default('6281234567890'),
  address: text('address').notNull(),
  open_hours: varchar('open_hours', { length: 150 }).notNull().default('Setiap Hari, 10.00 - 21.00 WIB'),
  maps_url: text('maps_url'),
  maps_embed_url: text('maps_embed_url'),
})

export const menuItems = mysqlTable('menu_items', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  category: mysqlEnum('category', ['bakso', 'mie', 'nasi', 'minuman']).notNull(),
  description: text('description').notNull(),
  price: int('price').notNull(),
  image_url: text('image_url').notNull(),
  is_available: boolean('is_available').notNull().default(true),
  is_bestseller: boolean('is_bestseller').notNull().default(false),
})

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey(),
  order_code: varchar('order_code', { length: 10 }).notNull().unique(),
  customer_name: varchar('customer_name', { length: 150 }).notNull(),
  customer_phone: varchar('customer_phone', { length: 30 }),
  order_type: mysqlEnum('order_type', ['dine_in', 'takeaway', 'delivery']).notNull(),
  table_number: varchar('table_number', { length: 30 }),
  delivery_address: text('delivery_address'),
  items_json: json('items_json').$type<OrderItem[]>().notNull(),
  total_amount: int('total_amount').notNull(),
  status: mysqlEnum('status', ['pending', 'preparing', 'completed', 'cancelled']).notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export type StoreSettingsRow = typeof storeSettings.$inferSelect
export type MenuItemRow = typeof menuItems.$inferSelect
export type OrderRow = typeof orders.$inferSelect
