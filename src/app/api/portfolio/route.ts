import { NextResponse } from 'next/server'
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
    const blobs = []
    let cursor: string | undefined
    do {
      const page = await PORTFOLIO_BUCKET.list({ prefix: 'portfolio/', limit: 1000, cursor })
      blobs.push(...page.objects)
      cursor = page.truncated ? page.cursor : undefined
    } while (cursor)

    const images = blobs
      .filter((object) => object.httpMetadata?.contentType?.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(object.key))
      .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime())
      .map((object) => ({
        id: object.key,
        title: titleFromPath(object.key),
        category: object.key.startsWith('portfolio/CHARACTER/') ? 'CHARACTER' as const : 'ILLUSTRATION' as const,
        year: String(object.uploaded.getFullYear()),
        image: `/api/portfolio/file/${object.key.split('/').map(encodeURIComponent).join('/')}`,
        aspectRatio: 'aspect-[0.94/1]',
      }))

    const fresh = new URL(request.url).searchParams.get('fresh') === '1'
    return NextResponse.json(images, {
      headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ error: 'Cloudflare R2 image storage is not configured.' }, { status: 503 })
  }
}
