import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

// Cache in all environments to prevent connection pool exhaustion
globalForPrisma.prisma = db

// Graceful shutdown for serverless environments (Vercel, etc.)
if (process.env.NODE_ENV !== 'production') {
  // In development, don't disconnect to allow hot reloading
  globalForPrisma.prisma = db
} else {
  // In production (Vercel), handle connection cleanup
  if (typeof window === 'undefined') {
    // Server-side only
    process.on('beforeExit', async () => {
      await db.$disconnect()
    })
  }
}
