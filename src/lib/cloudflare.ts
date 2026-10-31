export interface D1Result<T = any> {
  results: T[]
  success: boolean
  meta: { changes: number }
}

export interface D1Statement {
  bind(...values: any[]): D1Statement
  first<T = any>(colName?: string): Promise<T | null>
  all<T = any>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}

export interface D1Database {
  prepare(query: string): D1Statement
  batch(statements: D1Statement[]): Promise<D1Result[]>
}

export async function getPortfolioEnv(): Promise<any> {
  const mockStatement: any = {
    bind: () => mockStatement,
    first: async () => null,
    all: async () => ({ results: [], success: true, meta: { changes: 0 } }),
    run: async () => ({ success: true, results: [], meta: { changes: 0 } })
  }

  const mockDb: any = {
    prepare: () => mockStatement,
    batch: async () => []
  }

  const mockBucket: any = {
    list: async () => ({ objects: [] }),
    put: async () => {},
    get: async () => null,
    delete: async () => {}
  }

  return {
    DB: mockDb,
    PORTFOLIO_BUCKET: mockBucket,
    PORTFOLIO_ADMIN_PASSWORD: process.env.PORTFOLIO_ADMIN_PASSWORD || 'admin',
    GUESTBOOK_DEVICE_SECRET: process.env.GUESTBOOK_DEVICE_SECRET || 'secret',
  }
}
