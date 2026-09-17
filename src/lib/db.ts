import path from 'node:path'
import { PrismaClient } from '@prisma/client'

// ---------------------------------------------------------------------------
// SQLite URL resolution
//
// The Prisma CLI resolves relative `file:` URLs against prisma/schema.prisma,
// while the query engine at runtime anchors them against the process CWD —
// two different answers for the same string. To keep `db:push`, `db:seed`,
// `next dev` and the standalone server all opening ONE database file, this
// module normalizes the URL to an absolute path before the first client is
// constructed, using the CLI's rule (schema-relative) with the schema's
// canonical location `<project root>/prisma`.
//
//   .env DATABASE_URL="file:../db/custom.db"
//     -> CLI:      <root>/prisma/../db/custom.db = <root>/db/custom.db
//     -> runtime:  path.resolve(<cwd>/prisma, "../db/custom.db")
//     Both equal <root>/db/custom.db as long as the server is started from
//     the project root, which every npm/bun script in package.json does.
//
// Absolute file: URLs and non-SQLite URLs (e.g. Postgres in a hosted deploy)
// pass through untouched.
// ---------------------------------------------------------------------------
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    // Fresh checkout default — matches .env.example and the README setup.
    return `file:${path.resolve(process.cwd(), 'prisma', '../db/custom.db')}`
  }
  if (/^file:/i.test(url)) {
    const raw = url.replace(/^file:/i, '')
    // Windows drive letters (file:C:\...) are absolute too.
    if (path.isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw)) return `file:${raw}`
    return `file:${path.resolve(process.cwd(), 'prisma', raw)}`
  }
  return url
}

process.env.DATABASE_URL = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
