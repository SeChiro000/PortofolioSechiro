import { getPortfolioEnv } from '../../../../../lib/cloudflare'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const pathname = (await params).path.join('/')
  if (!pathname.startsWith('portfolio/') || pathname.split('/').some((part) => !part || part === '.' || part === '..')) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const { PORTFOLIO_BUCKET } = await getPortfolioEnv()
    const object = await PORTFOLIO_BUCKET.get(pathname)
    if (!object) return new Response('Not found', { status: 404 })

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('ETag', object.httpEtag)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('X-Content-Type-Options', 'nosniff')
    return new Response(object.body, { headers })
  } catch {
    return new Response('Image storage is unavailable', { status: 503 })
  }
}
