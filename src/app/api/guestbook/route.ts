import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../lib/cloudflare'
import { hasAdminSession } from '../../../lib/portfolio-admin'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

const DEVICE_COOKIE = 'sechiro_guestbook_device'
const DEVICE_COOKIE_AGE = 60 * 60 * 24 * 365
const MAX_ENTRIES = 100
const GUESTBOOK_FILE = path.join(process.cwd(), 'src', 'data', 'guestbook.json')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

type GuestbookEntry = { id: string; name: string; message: string; date: string }

function readLocalGuestbook(): GuestbookEntry[] {
  try {
    if (fs.existsSync(GUESTBOOK_FILE)) {
      return JSON.parse(fs.readFileSync(GUESTBOOK_FILE, 'utf8'))
    }
  } catch {}
  return []
}

function writeLocalGuestbook(entries: GuestbookEntry[]) {
  try {
    const dir = path.dirname(GUESTBOOK_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(entries, null, 2), 'utf8')
  } catch {}
}

async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase not configured')
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Supabase error: ${res.status} ${errText}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

function signDeviceId(id: string, guestbookSecret: string | undefined, adminPassword: string | undefined) {
  const secret = guestbookSecret || adminPassword || 'sechiro-fallback-secret'
  return createHash('sha256').update(`${id}:${secret}`).digest('hex')
}

function getDeviceId(request: Request, guestbookSecret: string | undefined, adminPassword: string | undefined) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
    const [k, ...v] = c.trim().split('=')
    return [k, decodeURIComponent(v.join('='))]
  }))
  const raw = cookies[DEVICE_COOKIE]
  if (raw) {
    const [id, sig] = raw.split('.')
    if (id && sig) {
      const expected = signDeviceId(id, guestbookSecret, adminPassword)
      if (sig === expected) return id
    }
  }
  return null
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function readEntries(): Promise<GuestbookEntry[]> {
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const data = await supabaseFetch('guestbook_entries?select=id,name,message,post_date&order=created_at.desc.nullslast&limit=100')
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          message: item.message,
          date: item.post_date || item.date || ''
        }))
      }
    }
  } catch (e) {
    console.error('Supabase read error:', e)
  }
  return readLocalGuestbook()
}

export async function GET(request: Request) {
  try {
    const { GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    const deviceId = getDeviceId(request, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)
    let hasPostedToday = false

    if (deviceId) {
      const today = todayUtc()
      const deviceHash = createHash('sha256').update(deviceId).digest('hex')
      try {
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
          const limits = await supabaseFetch(`guestbook_daily_limits?device_hash=eq.${deviceHash}&post_date=eq.${today}&select=id`)
          if (Array.isArray(limits) && limits.length > 0) hasPostedToday = true
        }
      } catch {}
    }

    const entries = await readEntries()
    const response = NextResponse.json({ entries, hasPostedToday }, { headers: { 'Cache-Control': 'no-store' } })
    
    const newDeviceId = deviceId || randomBytes(16).toString('hex')
    response.cookies.set(DEVICE_COOKIE, `${newDeviceId}.${signDeviceId(newDeviceId, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)}`, {
      httpOnly: true,
      secure: new URL(request.url).protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: DEVICE_COOKIE_AGE,
    })
    return response
  } catch {
    const entries = readLocalGuestbook()
    return NextResponse.json({ entries, hasPostedToday: false }, { headers: { 'Cache-Control': 'no-store' } })
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

  const today = todayUtc()
  const entry: GuestbookEntry = { id: randomBytes(12).toString('hex'), name, message, date: today }

  try {
    const { GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    const deviceId = getDeviceId(request, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)
    const activeDeviceId = deviceId || randomBytes(16).toString('hex')
    const deviceHash = createHash('sha256').update(activeDeviceId).digest('hex')

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      // Check limit
      const limits = await supabaseFetch(`guestbook_daily_limits?device_hash=eq.${deviceHash}&post_date=eq.${today}&select=id`)
      if (Array.isArray(limits) && limits.length > 0) {
        return NextResponse.json({ error: 'Perangkat ini sudah mengirim pesan hari ini. Coba lagi besok.', hasPostedToday: true }, { status: 429, headers: { 'Cache-Control': 'no-store' } })
      }

      // Insert limit
      await supabaseFetch('guestbook_daily_limits', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=ignore-duplicates' },
        body: JSON.stringify({ device_hash: deviceHash, post_date: today })
      })

      // Insert entry
      await supabaseFetch('guestbook_entries', {
        method: 'POST',
        body: JSON.stringify({ id: entry.id, name: entry.name, message: entry.message, post_date: entry.date })
      })

      const res = NextResponse.json({ entry, hasPostedToday: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
      res.cookies.set(DEVICE_COOKIE, `${activeDeviceId}.${signDeviceId(activeDeviceId, GUESTBOOK_DEVICE_SECRET, PORTFOLIO_ADMIN_PASSWORD)}`, {
        httpOnly: true,
        secure: new URL(request.url).protocol === 'https:',
        sameSite: 'lax',
        path: '/',
        maxAge: DEVICE_COOKIE_AGE,
      })
      return res
    }
  } catch (err) {
    console.error('Supabase POST error:', err)
  }

  // Fallback to local file
  const local = readLocalGuestbook()
  local.unshift(entry)
  writeLocalGuestbook(local.slice(0, MAX_ENTRIES))
  return NextResponse.json({ entry, hasPostedToday: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
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
  if (typeof id !== 'string' || !id) return jsonError('ID pesan tidak valid.', 400)

  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      await supabaseFetch(`guestbook_entries?id=eq.${id}`, { method: 'DELETE' })
    }
  } catch {}

  const local = readLocalGuestbook()
  const filtered = local.filter((item) => item.id !== id)
  writeLocalGuestbook(filtered)

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
