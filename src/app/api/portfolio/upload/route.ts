import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPortfolioEnv } from '../../../../lib/cloudflare'
import { hasAdminSession } from '../../../../lib/portfolio-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_UPLOAD_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: Request) {
  try {
    const { PORTFOLIO_ADMIN_PASSWORD, PORTFOLIO_BUCKET } = await getPortfolioEnv()
    if (!hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD)) {
      return NextResponse.json({ error: 'Sign in to upload artwork.' }, { status: 401 })
    }
    const origin = request.headers.get('origin')
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: 'Invalid upload request.' }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get('file')
    const category = form.get('category')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image file first.' }, { status: 400 })
    if (typeof category !== 'string' || !['SIMPLE', 'COMPLEX', 'CHIBI'].includes(category)) return NextResponse.json({ error: 'Choose a valid artwork category.' }, { status: 400 })
    const extension = ALLOWED_TYPES[file.type]
    if (!extension) return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed.' }, { status: 415 })
    if (file.size === 0 || file.size > MAX_UPLOAD_SIZE) return NextResponse.json({ error: 'Images must be between 1 byte and 20 MB.' }, { status: 413 })

    const slug = file.name
      .replace(/\.[^.]+$/, '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'artwork'
    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}-${slug}.${extension}`
    const pathname = `portfolio/${category}/${filename}`

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'gallery', 'uploads', category)
      await mkdir(uploadDir, { recursive: true })
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(uploadDir, filename), buffer)
    } catch (err) {
      console.error('Failed to save local upload:', err)
    }

    try {
      await PORTFOLIO_BUCKET.put(pathname, file.stream(), { httpMetadata: { contentType: file.type } })
    } catch {}

    return NextResponse.json({ success: true, pathname }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'The image could not be saved.' }, { status: 503 })
  }
}
