import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../../lib/cloudflare'
import { ADMIN_COOKIE_NAME, hasAdminSession } from '../../../../lib/portfolio-admin'

export async function GET(request: Request) {
  const { PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
  return NextResponse.json({ authenticated: hasAdminSession(request, PORTFOLIO_ADMIN_PASSWORD) })
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: new URL(request.url).protocol === 'https:',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return response
}
