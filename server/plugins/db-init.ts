import { ensureDatabaseReady, isDatabaseConfigured } from '../db'

export default defineNitroPlugin(async () => {
  if (!isDatabaseConfigured()) {
    console.info('[Bakso Berkah] Mode Preview Lokal aktif (DATABASE_URL belum diisi). Isi .env untuk terhubung ke TiDB Cloud.')
    return
  }

  try {
    await ensureDatabaseReady()
    console.info('[Bakso Berkah] TiDB Cloud siap & data awal telah terverifikasi.')
  } catch (err) {
    console.error('[Bakso Berkah] Gagal inisialisasi awal TiDB Cloud:', err)
  }
})
