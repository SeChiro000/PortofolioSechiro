import { NextResponse } from 'next/server'
import { getPortfolioEnv } from '../../../../lib/cloudflare'
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_SECONDS, createAdminSession, isCorrectAdminPassword } from '../../../../lib/portfolio-admin'

export async function POST(request: Request) {
  const { PORTFOLIO_ADMIN_PASSWORD } = await getPortfolioEnv()
  if (!PORTFOLIO_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin sign-in is not configured in the Cloudflare Worker secrets.' }, { status: 503 })
  }

  let password: unknown
  try {
    ;({ password } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Enter your admin password.' }, { status: 400 })
  }

  if (!isCorrectAdminPassword(password, PORTFOLIO_ADMIN_PASSWORD)) {
    return NextResponse.json({ error: 'That password did not match.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSession(PORTFOLIO_ADMIN_PASSWORD), {
    httpOnly: true,
    secure: new URL(request.url).protocol === 'https:',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_SECONDS,
  })
  return response
}
