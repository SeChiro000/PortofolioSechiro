import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../lib/cloudflare'
import { hasAdminSession } from '../../../lib/portfolio-admin'

export const dynamic = 'force-dynamic'

const DEVICE_COOKIE = 'sechiro_guestbook_device'
const DEVICE_COOKIE_AGE = 60 * 60 * 24 * 365
const MAX_ENTRIES = 100

type GuestbookEntry = { id: string; name: string; message: string; date: string }

function signDeviceId(id: string, guestbookSecret: string | undefined, adminPassword: string | undefined) {
  const secret = guestbookSecret || adminPassword
  if (!secret) throw new Error('Guestbook signing secret is not configured.')
  return createHmac('sha256', secret).update(id).digest('hex')
}

function getDeviceId(request: Request, guestbookSecret: string | undefined, adminPassword: string | undefined) {
  const raw = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${DEVICE_COOKIE}=`))?.slice(DEVICE_COOKIE.length + 1)
  if (!raw) return null
  try {
    const [id, signature] = decodeURIComponent(raw).split('.')
    if (!id || !signature) return null
    const supplied = Buffer.from(signature, 'hex')
    const expected = Buffer.from(signDeviceId(id, guestbookSecret, adminPassword), 'hex')
    return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? id : null
  } catch {
    return null
  }
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function readEntries() {
  const { DB } = await getPortfolioEnv()
  const result = await DB.prepare('SELECT id, name, message, post_date AS date FROM guestbook_entries ORDER BY created_at DESC LIMIT ?')
    .bind(MAX_ENTRIES)
    .all<GuestbookEntry>()
  return result.results
}

export async function GET(request: Request) {
  try {
    const { DB, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    const existingDeviceId = getDeviceId(request, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)
    const deviceId = existingDeviceId || randomBytes(24).toString('base64url')
    const today = todayUtc()
    const deviceHash = createHash('sha256').update(deviceId).digest('hex')
    const [entries, limit] = await Promise.all([
      readEntries(),
      DB.prepare('SELECT 1 AS posted FROM guestbook_daily_limits WHERE device_hash = ? AND post_date = ?')
        .bind(deviceHash, today)
        .first<{ posted: number }>(),
    ])
    const response = NextResponse.json({ entries, hasPostedToday: Boolean(limit) }, { headers: { 'Cache-Control': 'no-store' } })
    if (!existingDeviceId) {
      response.cookies.set(DEVICE_COOKIE, `${deviceId}.${signDeviceId(deviceId, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)}`, {
        httpOnly: true,
        secure: new URL(request.url).protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: DEVICE_COOKIE_AGE,
      })
    }
    return response
  } catch {
    return jsonError('Buku tamu belum terhubung ke database Cloudflare. Coba lagi nanti.', 503)
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  try {
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) return jsonError('Permintaan tidak valid.', 403)
  } catch {
    return jsonError('Permintaan tidak valid.', 403)
  }

  let payload: { name?: unknown; message?: unknown }
  try {
    payload = await request.json()
  } catch {
    return jsonError('Isi nama dan pesan terlebih dahulu.', 400)
  }

  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const message = typeof payload.message === 'string' ? payload.message.trim() : ''
  if (!name || name.length > 30 || !message || message.length > 180) return jsonError('Nama maksimal 30 karakter dan pesan maksimal 180 karakter.', 400)

  try {
    const { DB, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    const deviceId = getDeviceId(request, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)
    if (!deviceId) return jsonError('Tidak dapat mengenali perangkat. Muat ulang halaman lalu coba lagi.', 400)
    const today = todayUtc()
    const deviceHash = createHash('sha256').update(deviceId).digest('hex')
    const entry: GuestbookEntry = { id: randomBytes(12).toString('hex'), name, message, date: today }
    const results = await DB.batch([
      DB.prepare('INSERT INTO guestbook_daily_limits (device_hash, post_date) VALUES (?, ?) ON CONFLICT(device_hash, post_date) DO NOTHING')
        .bind(deviceHash, today),
      DB.prepare('INSERT INTO guestbook_entries (id, name, message, post_date) SELECT ?, ?, ?, ? WHERE changes() = 1')
        .bind(entry.id, entry.name, entry.message, entry.date),
      DB.prepare("DELETE FROM guestbook_daily_limits WHERE post_date < date('now', '-3 days')"),
    ])
    if (results[0].meta.changes !== 1) {
      return NextResponse.json({ error: 'Perangkat ini sudah mengirim pesan hari ini. Coba lagi besok.', hasPostedToday: true }, { status: 429, headers: { 'Cache-Control': 'no-store' } })
    }
    if (results[1].meta.changes !== 1) return jsonError('Pesan gagal disimpan. Coba lagi nanti.', 503)
    return NextResponse.json({ entry, hasPostedToday: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Pesan belum terkirim karena database Cloudflare sedang tidak tersedia. Coba lagi nanti.', 503)
  }
}

export async function DELETE(request: Request) {
  const { PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
  if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) return jsonError('Akses admin diperlukan.', 401)
  let id: unknown
  try {
    ;({ id } = await request.json())
  } catch {
    return jsonError('Pesan yang akan dihapus tidak valid.', 400)
  }
  if (typeof id !== 'string' || !/^[a-f0-9]{24}$/.test(id)) return jsonError('Pesan yang akan dihapus tidak valid.', 400)
  try {
    const { DB } = await getPortfolioEnv()
    await DB.prepare('DELETE FROM guestbook_entries WHERE id = ?').bind(id).run()
    return NextResponse.json({ entries: await readEntries() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Pesan gagal dihapus. Coba lagi nanti.', 503)
  }
}
