import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE_NAME = 'sechiro_portfolio_admin'
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7

function passwordDigest(value: string) {
  return createHash('sha256').update(value).digest()
}

export function isCorrectAdminPassword(value: unknown, configuredPassword: string | undefined) {
  if (!configuredPassword || typeof value !== 'string') return false
  return timingSafeEqual(passwordDigest(value), passwordDigest(configuredPassword))
}

export function createAdminSession(configuredPassword: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS
  const signature = createHmac('sha256', configuredPassword)
    .update(String(expiresAt))
    .digest('hex')
  return `${expiresAt}.${signature}`
}

export function hasAdminSession(request: Request, configuredPassword: string | undefined) {
  if (!configuredPassword) return false

  const cookieHeader = request.headers.get('cookie') || ''
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_COOKIE_NAME}=`))
  if (!cookie) return false

  let token: string
  try {
    token = decodeURIComponent(cookie.slice(ADMIN_COOKIE_NAME.length + 1))
  } catch {
    return false
  }
  const [expiresText, suppliedSignature] = token.split('.')
  const expiresAt = Number(expiresText)
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !suppliedSignature) return false

  const expectedSignature = createHmac('sha256', configuredPassword)
    .update(String(expiresAt))
    .digest('hex')
  const supplied = Buffer.from(suppliedSignature, 'hex')
  const expected = Buffer.from(expectedSignature, 'hex')
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}
