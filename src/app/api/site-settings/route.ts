import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../lib/cloudflare'
import { hasAdminSession } from '../../../lib/portfolio-admin'

export const dynamic = 'force-dynamic'

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

const DEFAULT_ABOUT: AboutSettings = {
  eyebrow: 'THE ARTIST BEHIND THE DOODLES',
  name: 'SECHIRO.',
  description: 'I make expressive character art, playful illustrations, and drawings with a life of their own.',
  image: '/gallery/aboutme.png',
}

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
    const { DB } = await getPortfolioEnv()
    const rows = (await DB.prepare('SELECT setting_key, setting_value FROM site_settings').all()) as { results?: { setting_key: string; setting_value: string }[] }
    let about = DEFAULT_ABOUT
    let commissionStatus = 'OPEN'
    let commissionTiers = DEFAULT_TIERS
    let commissionQueue = [
      { clientName: 'Client A', artType: 'Character Art', status: 'In Progress' },
      { clientName: 'Client B', artType: 'Custom Illustration', status: 'In Queue' }
    ]

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
      }
    }

    return NextResponse.json({ about, commissionStatus, commissionTiers, commissionQueue, saved: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ about: DEFAULT_ABOUT, commissionStatus: 'OPEN', commissionTiers: DEFAULT_TIERS, commissionQueue: [], saved: false }, { headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function PUT(request: Request) {
  try {
    const { DB, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) return error('Akses admin diperlukan.', 401)
    const origin = request.headers.get('origin')
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) return error('Permintaan tidak valid.', 403)

    const payload = await request.json() as {
      about?: Partial<AboutSettings>
      commissionStatus?: string
      commissionTiers?: CommissionTier[]
      commissionQueue?: any[]
    }

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
      await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('about', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
        .bind(JSON.stringify(normalized))
        .run()
    }

    if (payload.commissionStatus) {
      const status = payload.commissionStatus.trim()
      if (!['OPEN', 'WAITLIST', 'CLOSED'].includes(status)) return error('Status komisi tidak valid.', 400)
      await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('commission_status', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
        .bind(status)
        .run()
    }

    if (payload.commissionTiers && Array.isArray(payload.commissionTiers)) {
      await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('commission_tiers', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
        .bind(JSON.stringify(payload.commissionTiers))
        .run()
    }

    if (payload.commissionQueue && Array.isArray(payload.commissionQueue)) {
      await DB.prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('commission_queue', ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP")
        .bind(JSON.stringify(payload.commissionQueue))
        .run()
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return error('Perubahan gagal disimpan.', 503)
  }
}
