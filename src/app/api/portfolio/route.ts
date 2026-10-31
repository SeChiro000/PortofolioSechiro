import { NextResponse } from 'next/server'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { getPortfolioEnv } from '../../../lib/cloudflare'

export const dynamic = 'force-dynamic'

function titleFromPath(pathname: string) {
  const filename = pathname.split('/').pop()?.replace(/\.[^.]+$/, '') || 'New artwork'
  const readable = filename.replace(/^\d+-\d+-/, '').replace(/[-_]+/g, ' ').trim()
  return readable.replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'New artwork'
}

export async function GET(request: Request) {
  try {
    const { PORTFOLIO_BUCKET } = await getPortfolioEnv()
    const blobs: { key: string; uploaded: Date }[] = []

    try {
      let cursor: string | undefined
      do {
        const page = await PORTFOLIO_BUCKET.list({ prefix: 'portfolio/', limit: 1000, cursor })
        for (const obj of page.objects || []) {
          blobs.push({ key: obj.key, uploaded: obj.uploaded || new Date() })
        }
        cursor = page.truncated ? page.cursor : undefined
      } while (cursor)
    } catch {}

    try {
      const uploadsBase = path.join(process.cwd(), 'public', 'gallery', 'uploads')
      for (const cat of ['ILLUSTRATION', 'CHARACTER']) {
        const catDir = path.join(uploadsBase, cat)
        try {
          const files = await readdir(catDir)
          for (const file of files) {
            if (/\.(jpe?g|png|webp|gif)$/i.test(file)) {
              const filePath = path.join(catDir, file)
              const st = await stat(filePath)
              const key = `portfolio/${cat}/${file}`
              if (!blobs.some(b => b.key === key)) {
                blobs.push({ key, uploaded: st.mtime })
              }
            }
          }
        } catch {}
      }
    } catch {}

    const images = blobs
      .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime())
      .map((object) => {
        const parts = object.key.split('/')
        const isLocalUpload = parts.length >= 3 && parts[0] === 'portfolio'
        const imageUrl = isLocalUpload ? `/gallery/uploads/${parts[1]}/${parts[2]}` : `/api/portfolio/file/${object.key.split('/').map(encodeURIComponent).join('/')}`

        return {
          id: object.key,
          title: titleFromPath(object.key),
          category: object.key.startsWith('portfolio/CHARACTER/') ? 'CHARACTER' as const : 'ILLUSTRATION' as const,
          year: String(object.uploaded.getFullYear()),
          image: imageUrl,
          aspectRatio: 'aspect-[0.94/1]',
        }
      })

    const fresh = new URL(request.url).searchParams.get('fresh') === '1'
    return NextResponse.json(images, {
      headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Image storage could not be loaded.' }, { status: 503 })
  }
}
