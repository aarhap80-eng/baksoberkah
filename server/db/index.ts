import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import { sql } from 'drizzle-orm'
import * as schema from './schema'
import { INITIAL_MENU_ITEMS, INITIAL_STORE_SETTINGS } from './seed-data'

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

let poolInstance: mysql.Pool | null = null
let dbInstance: DrizzleDb | null = null
let initPromise: Promise<void> | null = null

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim()
  const host = process.env.TIDB_HOST?.trim()
  return Boolean(url || host)
}

function getConnectionConfig(): mysql.PoolOptions {
  const urlString = process.env.DATABASE_URL?.trim()

  if (urlString) {
    const parsed = new URL(urlString)
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 4000,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, '') || 'bakso_berkah',
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
      connectTimeout: 20000,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    }
  }

  return {
    host: process.env.TIDB_HOST?.trim(),
    port: Number(process.env.TIDB_PORT || 4000),
    user: process.env.TIDB_USER?.trim(),
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE?.trim() || 'bakso_berkah',
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  }
}

export function getPool(): mysql.Pool {
  if (!isDatabaseConfigured()) {
    throw new Error('TiDB Cloud belum dikonfigurasi. Isi DATABASE_URL pada file .env terlebih dahulu.')
  }

  if (!poolInstance) {
    poolInstance = mysql.createPool(getConnectionConfig())
  }
  return poolInstance
}

export function getDb(): DrizzleDb {
  if (!dbInstance) {
    const pool = getPool()
    dbInstance = drizzle(pool, { schema, mode: 'default' })
  }
  return dbInstance
}

async function createTablesIfNotExist(pool: mysql.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_settings (
      id INT PRIMARY KEY DEFAULT 1,
      store_name VARCHAR(150) NOT NULL DEFAULT 'Bakso Berkah',
      tagline VARCHAR(255) NOT NULL DEFAULT 'Gurih Kuahnya, Mantap Dagingnya',
      is_open BOOLEAN NOT NULL DEFAULT TRUE,
      whatsapp_number VARCHAR(30) NOT NULL DEFAULT '6281234567890',
      address TEXT NOT NULL,
      open_hours VARCHAR(150) NOT NULL DEFAULT 'Setiap Hari, 10.00 - 21.00 WIB',
      maps_url TEXT NULL,
      maps_embed_url TEXT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category ENUM('bakso', 'mie', 'nasi', 'minuman') NOT NULL,
      description TEXT NOT NULL,
      price INT NOT NULL,
      image_url TEXT NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      is_bestseller BOOLEAN NOT NULL DEFAULT FALSE
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(36) PRIMARY KEY,
      order_code VARCHAR(10) NOT NULL UNIQUE,
      customer_name VARCHAR(150) NOT NULL,
      customer_phone VARCHAR(30) NULL,
      order_type ENUM('dine_in', 'takeaway', 'delivery') NOT NULL,
      table_number VARCHAR(30) NULL,
      delivery_address TEXT NULL,
      items_json JSON NOT NULL,
      total_amount INT NOT NULL,
      status ENUM('pending', 'preparing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export async function seedDatabase(): Promise<{ seededStore: boolean; seededMenuCount: number }> {
  const db = getDb()
  let seededStore = false
  let seededMenuCount = 0

  const existingStore = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.storeSettings)

  if (Number(existingStore[0]?.count ?? 0) === 0) {
    await db.insert(schema.storeSettings).values({
      id: INITIAL_STORE_SETTINGS.id,
      store_name: INITIAL_STORE_SETTINGS.store_name,
      tagline: INITIAL_STORE_SETTINGS.tagline,
      is_open: INITIAL_STORE_SETTINGS.is_open,
      whatsapp_number: INITIAL_STORE_SETTINGS.whatsapp_number,
      address: INITIAL_STORE_SETTINGS.address,
      open_hours: INITIAL_STORE_SETTINGS.open_hours,
      maps_url: INITIAL_STORE_SETTINGS.maps_url,
      maps_embed_url: INITIAL_STORE_SETTINGS.maps_embed_url,
    })
    seededStore = true
  }

  const existingMenu = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.menuItems)

  if (Number(existingMenu[0]?.count ?? 0) === 0) {
    await db.insert(schema.menuItems).values(INITIAL_MENU_ITEMS)
    seededMenuCount = INITIAL_MENU_ITEMS.length
  }

  return { seededStore, seededMenuCount }
}

export async function ensureDatabaseReady(): Promise<void> {
  if (!isDatabaseConfigured()) return

  if (!initPromise) {
    initPromise = (async () => {
      const pool = getPool()
      await createTablesIfNotExist(pool)
      await seedDatabase()
    })().catch((err) => {
      initPromise = null
      throw err
    })
  }

  return initPromise
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end()
    poolInstance = null
    dbInstance = null
    initPromise = null
  }
}
