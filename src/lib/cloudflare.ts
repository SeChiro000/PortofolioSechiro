import { getCloudflareContext } from '@opennextjs/cloudflare'

export interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  meta: { changes: number }
}

export interface D1Statement {
  bind(...values: unknown[]): D1Statement
  first<T = unknown>(): Promise<T | null>
  all<T = unknown>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}

export interface D1Database {
  prepare(query: string): D1Statement
  batch(statements: D1Statement[]): Promise<D1Result[]>
}

export interface R2ObjectItem {
  key: string
  uploaded: Date
  size: number
  httpMetadata?: { contentType?: string }
}

export interface R2ObjectBody extends R2ObjectItem {
  body: ReadableStream<Uint8Array>
  httpEtag: string
  writeHttpMetadata(headers: Headers): void
}

export interface R2Bucket {
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    objects: R2ObjectItem[]
    truncated: boolean
    cursor?: string
  }>
  put(key: string, value: ReadableStream<Uint8Array> | ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
  get(key: string): Promise<R2ObjectBody | null>
  delete(key: string): Promise<void>
}

export interface PortfolioCloudflareEnv {
  DB: D1Database
  PORTFOLIO_BUCKET: R2Bucket
  PORTFOLIO_ADMIN_PASSWORD?: string
  GUESTBOOK_DEVICE_SECRET?: string
}

export async function getPortfolioEnv() {
  const context = await getCloudflareContext({ async: true })
  return context.env as unknown as PortfolioCloudflareEnv
}
