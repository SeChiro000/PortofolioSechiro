import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../lib/cloudflare'
import { hasAdminSession } from '../../../lib/portfolio-admin'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

const PORTFOLIO_FILE = path.join(process.cwd(), 'src', 'data', 'portfolio.json')
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

type PortfolioItem = {
  id: string
  title: string
  category: 'ILLUSTRATION' | 'CHARACTER'
  image: string
  year: string
  aspectRatio?: string
}

function readLocalPortfolio(): PortfolioItem[] {
  try {
    if (fs.existsSync(PORTFOLIO_FILE)) {
      return JSON.parse(fs.readFileSync(PORTFOLIO_FILE, 'utf8'))
    }
  } catch {}
  return [
    {
      id: 'default-1',
      title: 'Iroha',
      category: 'CHARACTER',
      image: '/gallery/ProfilePIcture.jpg',
      year: '2026',
      aspectRatio: 'aspect-[0.94/1]'
    }
  ]
}

function writeLocalPortfolio(items: PortfolioItem[]) {
  try {
    const dir = path.dirname(PORTFOLIO_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(items, null, 2), 'utf8')
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

export async function GET(request: Request) {
  try {
    let items: PortfolioItem[] = []
    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const data = await supabaseFetch('portfolio_artworks?select=id,title,category,image,year&order=created_at.desc.nullslast')
        if (Array.isArray(data) && data.length > 0) {
          items = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'ILLUSTRATION',
            image: item.image,
            year: item.year || '2026',
            aspectRatio: 'aspect-[0.94/1]'
          }))
        }
      }
    } catch (e) {
      console.error('Supabase portfolio read error:', e)
    }

    if (items.length === 0) {
      items = readLocalPortfolio()
    }

    const fresh = new URL(request.url).searchParams.get('fresh') === '1'
    return NextResponse.json(items, {
      headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json(readLocalPortfolio(), { headers: { 'Cache-Control': 'no-store' } })
  }
}

export async function POST(request: Request) {
  try {
    const { PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) {
      return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 401 })
    }

    const payload = await request.json() as {
      id?: string
      title?: string
      category?: 'ILLUSTRATION' | 'CHARACTER'
      image?: string
      year?: string
    }

    if (!payload.image || !payload.title) {
      return NextResponse.json({ error: 'Gambar dan judul wajib diisi.' }, { status: 400 })
    }

    const newItem: PortfolioItem = {
      id: payload.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: String(payload.title).trim(),
      category: payload.category === 'CHARACTER' ? 'CHARACTER' : 'ILLUSTRATION',
      image: String(payload.image),
      year: String(payload.year || new Date().getFullYear()),
      aspectRatio: 'aspect-[0.94/1]'
    }

    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        await supabaseFetch('portfolio_artworks', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=ignore-duplicates' },
          body: JSON.stringify({
            id: newItem.id,
            title: newItem.title,
            category: newItem.category,
            image: newItem.image,
            year: newItem.year
          })
        })
      }
    } catch (err) {
      console.error('Supabase portfolio insert error:', err)
    }

    const local = readLocalPortfolio()
    local.unshift(newItem)
    writeLocalPortfolio(local)

    return NextResponse.json({ success: true, item: newItem }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menyimpan karya.' }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
    if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) {
      return NextResponse.json({ error: 'Akses admin diperlukan.' }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID karya tidak valid.' }, { status: 400 })

    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        await supabaseFetch(`portfolio_artworks?id=eq.${id}`, { method: 'DELETE' })
      }
    } catch {}

    const local = readLocalPortfolio()
    const filtered = local.filter(item => item.id !== id)
    writeLocalPortfolio(filtered)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus karya.' }, { status: 503 })
  }
}
