import 'dotenv/config'
import { closePool, ensureDatabaseReady, isDatabaseConfigured, seedDatabase } from './index'

async function main() {
  if (!isDatabaseConfigured()) {
    console.error('[Bakso Berkah Seed] DATABASE_URL atau TIDB_HOST belum diisi di file .env.')
    console.error('Contoh: DATABASE_URL=mysql://user:pass@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/bakso_berkah')
    process.exit(1)
  }

  console.log('[Bakso Berkah Seed] Menghubungkan ke TiDB Cloud (SSL/TLS aktif)...')
  await ensureDatabaseReady()
  const result = await seedDatabase()
  console.log('[Bakso Berkah Seed] Selesai!', result)
  await closePool()
}

main().catch(async (err) => {
  console.error('[Bakso Berkah Seed] Gagal:', err)
  await closePool()
  process.exit(1)
})
