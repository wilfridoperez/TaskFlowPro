import { PrismaClient } from '@prisma/client'

// Global instance to avoid multiple connections
declare global {
    var prismaInstance: PrismaClient | undefined
}

let prismaClient: PrismaClient | null = null
let connectionError: Error | null = null

// Lazy initialize Prisma client only when actually needed
export function getPrismaClient(): PrismaClient {
    if (!prismaClient) {
        console.log('[Prisma] Initializing client (async)...')
        try {
            prismaClient = new PrismaClient({
                log: [],
                errorFormat: 'pretty',
            })
            // Connect asynchronously without blocking
            prismaClient.$connect()
                .then(() => console.log('[Prisma] Connected successfully'))
                .catch(err => {
                    connectionError = err
                    console.error('[Prisma] Connection failed (will retry on query):', err.message)
                })
        } catch (error) {
            connectionError = error as Error
            console.error('[Prisma] Failed to create client:', error)
            // Don't throw - allow app to continue
        }
    }
    return prismaClient!
}

// Safe wrapper that returns null if database is unavailable
export function getPrismaClientSafe() {
    try {
        return getPrismaClient()
    } catch (error) {
        console.error('[Prisma] Error getting client:', error)
        return null
    }
}

// For backwards compatibility - return proxy that initializes on first use
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrismaClient()
        return (client as any)[prop]
    }
})

export default prisma
