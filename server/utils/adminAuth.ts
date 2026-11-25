import crypto from 'node:crypto'
import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, getHeader, setCookie } from 'h3'

const COOKIE_NAME = 'bakso_berkah_admin'
const SESSION_MAX_AGE = 60 * 60 * 12 // 12 hours

function getAdminSecrets() {
  const config = useRuntimeConfig()
  const pin = String(config.adminPin || process.env.ADMIN_PIN || '1234').trim()
  const secret = String(config.adminSessionSecret || process.env.ADMIN_SESSION_SECRET || 'bakso-berkah-session-secret')
  return { pin, secret }
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function signToken(exp: number, secret: string): string {
  const payload = `admin.${exp}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function verifyToken(token: string, secret: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'admin') return false
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  const expected = signToken(exp, secret)
  return safeCompare(token, expected)
}

export function verifyAdminPin(inputPin: string): boolean {
  const { pin } = getAdminSecrets()
  return safeCompare(String(inputPin || '').trim(), pin)
}

export function setAdminSessionCookie(event: H3Event): void {
  const { secret } = getAdminSecrets()
  const exp = Date.now() + SESSION_MAX_AGE * 1000
  const token = signToken(exp, secret)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export function clearAdminSessionCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function isAdminAuthenticated(event: H3Event): boolean {
  const { secret } = getAdminSecrets()
  const cookieToken = getCookie(event, COOKIE_NAME)
  if (cookieToken && verifyToken(cookieToken, secret)) {
    return true
  }

  const headerPin = getHeader(event, 'x-admin-pin')
  if (headerPin && verifyAdminPin(headerPin)) {
    return true
  }

  return false
}

export function requireAdminAuth(event: H3Event): void {
  if (!isAdminAuthenticated(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Akses ditolak. Silakan masuk dengan PIN Admin terlebih dahulu.',
    })
  }
}
