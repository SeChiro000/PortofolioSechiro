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

const DEFAULT_ABOUT: AboutSettings = {
  eyebrow: 'THE ARTIST BEHIND THE DOODLES',
  name: 'SECHIRO.',
  description: 'I make expressive character art, playful illustrations, and drawings with a life of their own.',
  image: '/gallery/aboutme.png',
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function GET() {
  try {
    const { DB } = await getPortfolioEnv()
    const saved = await DB.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?')
      .bind('about')
      .first<{ setting_value: string }>()
    if (!saved) return NextResponse.json({ about: DEFAULT_ABOUT, saved: false }, { headers: { 'Cache-Control': 'no-store' } })
    try {
      return NextResponse.json({ about: { ...DEFAULT_ABOUT, ...JSON.parse(saved.setting_value) }, saved: true }, { headers: { 'Cache-Control': 'no-store' } })
    } catch {
      return NextResponse.json({ about: DEFAULT_ABOUT, saved: false }, { headers: { 'Cache-Control': 'no-store' } })
    }
  } catch {
    return error('Pengaturan situs belum tersedia di database Cloudflare.', 503)
  }
}

export async function PUT(request: Request) {
  try {
    const { DB, PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) return error('Akses admin diperlukan.', 401)
    const origin = request.headers.get('origin')
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) return error('Permintaan tidak valid.', 403)

    const payload = await request.json() as { about?: Partial<AboutSettings> }
    const about = payload.about
    if (!about || typeof about.eyebrow !== 'string' || typeof about.name !== 'string' || typeof about.description !== 'string' || typeof about.image !== 'string') {
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
    return NextResponse.json({ about: normalized }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return error('Perubahan About Me gagal disimpan.', 503)
  }
}
