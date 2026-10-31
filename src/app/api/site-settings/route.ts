import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../lib/cloudflare'
import { hasAdminSession } from '../../../lib/portfolio-admin'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'site-settings.json')

function readLocalSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
    }
  } catch {}
  return {}
}

function writeLocalSettings(data: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch {}
}

export type AboutSettings = {
  eyebrow: string
  name: string
  description: string
  image: string
}

export type CommissionTier = {
  id: string
  title: string
  tag: string
  price: string
  timeframe: string
  description: string
  icon: string
}

export type CharacterItem = {
  id: number
  name: string
  role: string
  mood: string
  description: string
  initials: string
  image: string
}

const DEFAULT_ABOUT: AboutSettings = {
  eyebrow: 'THE ARTIST BEHIND THE DOODLES',
  name: 'SECHIRO.',
  description: 'I make expressive character art, playful illustrations, and drawings with a life of their own.',
  image: '/gallery/aboutme.png',
}

const DEFAULT_CHARACTERS: CharacterItem[] = [
  { id: 1, name: 'Iroha', role: 'ILLUSTRATION', mood: 'Soft & Whimsical', description: 'A playful illustration study focusing on soft forms.', initials: 'IR', image: '/gallery/ProfilePIcture.jpg' },
  { id: 2, name: 'Karasu', role: '2D CHARACTER', mood: 'Sharp & Celestial', description: 'A character concept with sharp lines and a celestial mood.', initials: 'KR', image: '/gallery/aboutme.png' },
  { id: 3, name: 'Momo', role: 'CHIBI', mood: 'Cute & Vibrant', description: 'A chibi study with cute proportions and a bright personality.', initials: 'MM', image: '/gallery/aboutme.png' }
]

const DEFAULT_TIERS: CommissionTier[] = [
  {
    id: 'character',
    title: 'CHARACTER ART',
    tag: 'CHARACTER FOCUS',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'Expressive hand-drawn character illustrations tailored to your vision.',
    icon: '✦',
  },
  {
    id: 'illustration',
    title: 'CUSTOM ILLUSTRATION',
    tag: 'MADE FOR YOUR IDEA',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'A hand-drawn scene, object, or concept illustrated in a playful, colorful style.',
    icon: '✿',
  },
  {
    id: 'doodles',
    title: 'DOODLE PACK & GRAPHICS',
    tag: 'CREATIVE',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'Custom playful doodle sets, icons, and visual assets for your brand.',
    icon: '♪',
  },
]

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function GET() {
  try {
    const local = readLocalSettings()
    let about = local.about || DEFAULT_ABOUT
    let commissionStatus = local.commissionStatus || 'OPEN'
    let commissionTiers = local.commissionTiers || DEFAULT_TIERS
    let commissionQueue = local.commissionQueue || []
    let characters = local.characters || DEFAULT_CHARACTERS

    try {
      const { DB } = await getPortfolioEnv()
      const rows = (await DB.prepare('SELECT setting_key, setting_value FROM site_settings').all()) as { results?: { setting_key: string; setting_value: string }[] }
      const list = rows.results || []
      for (const row of list) {
        if (row.setting_key === 'about') {
          try { about = { ...DEFAULT_ABOUT, ...JSON.parse(row.setting_value) } } catch {}
        } else if (row.setting_key === 'commission_status') {
          commissionStatus = row.setting_value
        } else if (row.setting_key === 'commission_tiers') {
          try { commissionTiers = JSON.parse(row.setting_value) } catch {}
        } else if (row.setting_key === 'commission_queue') {
          try { commissionQueue = JSON.parse(row.setting_value) } catch {}
        } else if (row.setting_key === 'characters') {
          try { characters = JSON.parse(row.setting_value) } catch {}
        }
      }
    } catch {}

    if (!commissionQueue.length && local.commissionQueue && local.commissionQueue.length) {
      commissionQueue = local.commissionQueue
    }
    if (local.commissionStatus && commissionStatus === 'OPEN') {
      commissionStatus = local.commissionStatus
    }
    if (local.commissionTiers && local.commissionTiers.length) {
      commissionTiers = local.commissionTiers
    }
    if (local.characters && local.characters.length) {
      characters = local.characters
    }

    return NextResponse.json({ about, commissionStatus, commissionTiers, commissionQueue, characters, saved: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    const local = readLocalSettings()
    return NextResponse.json({
      about: local.about || DEFAULT_ABOUT,
      commissionStatus: local.commissionStatus || 'OPEN',
      commissionTiers: local.commissionTiers || DEFAULT_TIERS,
      commissionQueue: local.commissionQueue || [],
      characters: local.characters || DEFAULT_CHARACTERS,
      saved: false
    }, { headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function PUT(request: Request) {
  try {
    const { DB, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) return error('Akses admin diperlukan.', 401)
    const origin = request.headers.get('origin')
    if (origin) {
      try {
        const originHost = new URL(origin).host
        const reqHost = request.headers.get('host')
        if (reqHost && originHost !== reqHost) {
          return error('Permintaan tidak valid.', 403)
        }
      } catch {}
    }

    const payload = await request.json() as {
      about?: Partial<AboutSettings>
      commissionStatus?: string
      commissionTiers?: CommissionTier[]
      commissionQueue?: any[]
      characters?: CharacterItem[]
    }

    const local = readLocalSettings()

    if (payload.about) {
      const about = payload.about
      if (typeof about.eyebrow !== 'string' || typeof about.name !== 'string' || typeof about.description !== 'string' || typeof about.image !== 'string') {
        return error('Isi About Me tidak lengkap.', 400)
      }
      if (about.eyebrow.length > 80 || about.name.length > 50 || about.description.length > 500 || about.image.length > 1_500_000) {
        return error('Salah satu isi About Me melewati batas ukuran.', 413)
      }
      const validImage = about.image.startsWith('/gallery/') || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(about.image)
      if (!validImage) return error('Gunakan gambar di galeri atau JPG/PNG/WebP.', 400)

      const normalized = {
        eyebrow: about.eyebrow.trim(),
        name: about.name.trim(),
        description: about.description.trim(),
        image: about.image,
      }
      local.about = normalized
      try {
        await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('about', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
          .bind(JSON.stringify(normalized))
          .run()
      } catch {}
    }

    if (payload.commissionStatus) {
      const status = payload.commissionStatus.trim()
      if (!['OPEN', 'WAITLIST', 'CLOSED'].includes(status)) return error('Status komisi tidak valid.', 400)
      local.commissionStatus = status
      try {
        await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('commission_status', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
          .bind(status)
          .run()
      } catch {}
    }

    if (payload.commissionTiers && Array.isArray(payload.commissionTiers)) {
      local.commissionTiers = payload.commissionTiers
      try {
        await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('commission_tiers', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
          .bind(JSON.stringify(payload.commissionTiers))
          .run()
      } catch {}
    }

    if (payload.commissionQueue && Array.isArray(payload.commissionQueue)) {
      local.commissionQueue = payload.commissionQueue
      try {
        await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('commission_queue', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
          .bind(JSON.stringify(payload.commissionQueue))
          .run()
      } catch {}
    }

    if (payload.characters && Array.isArray(payload.characters)) {
      local.characters = payload.characters
      try {
        await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('characters', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
          .bind(JSON.stringify(payload.characters))
          .run()
      } catch {}
    }

    writeLocalSettings(local)

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return error('Perubahan gagal disimpan.', 503)
  }
}
