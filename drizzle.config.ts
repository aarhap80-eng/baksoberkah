import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

function getDbCredentials() {
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
        rejectUnauthorized: true,
      },
    }
  }

  return {
    host: process.env.TIDB_HOST || 'localhost',
    port: Number(process.env.TIDB_PORT || 4000),
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'bakso_berkah',
    ssl: {
      rejectUnauthorized: true,
    },
  }
}

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: getDbCredentials(),
})
