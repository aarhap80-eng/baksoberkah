import { getDbMode, getStoreSettings } from '../db/repository'

export default defineEventHandler(async () => {
  const store = await getStoreSettings()
  return {
    store,
    dbMode: getDbMode(),
  }
})
