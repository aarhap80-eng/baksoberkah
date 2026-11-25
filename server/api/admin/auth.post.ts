import { createError, readBody } from 'h3'
import { setAdminSessionCookie, verifyAdminPin } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pin = String(body?.pin || '').trim()

  if (!pin || !verifyAdminPin(pin)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'PIN salah. Silakan coba lagi.',
    })
  }

  setAdminSessionCookie(event)
  return { authenticated: true }
})
