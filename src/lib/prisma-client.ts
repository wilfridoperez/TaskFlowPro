import { PrismaClient } from '@prisma/client'
import { createPrismaFallback } from './prisma-fallback'

// Global instance to avoid multiple connections
declare global {
    var prismaInstance: PrismaClient | undefined
}

let prismaClient: PrismaClient | null = null
let fallbackClient: any = null
let connectionError: Error | null = null
let usingFallback = false

// Lazy initialize Prisma client only when actually needed
export function getPrismaClient(): any {
    if (!prismaClient && !fallbackClient) {
        console.log('[Prisma] Initializing client (async)...')
        try {
            prismaClient = new PrismaClient({
                log: [],
                errorFormat: 'pretty',
            })
            // Connect asynchronously without blocking, with timeout
            const connectPromise = prismaClient.$connect()

            // Set a timeout - if connection takes more than 5 seconds, use fallback
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Connection timeout after 5 seconds'))
                }, 5000)
            })

            Promise.race([connectPromise, timeoutPromise])
                .then(() => {
                    console.log('[Prisma] Connected successfully')
                    usingFallback = false
                })
                .catch(err => {
                    connectionError = err
                    console.error('[Prisma] Connection failed, using fallback data:', err.message)
                    prismaClient = null
                    fallbackClient = createPrismaFallback()
                    usingFallback = true
                })
        } catch (error) {
            connectionError = error as Error
            console.error('[Prisma] Failed to create client, using fallback:', error)
            fallbackClient = createPrismaFallback()
            usingFallback = true
            // Don't throw - allow app to continue
        }
    }

    // Return whichever client is available (real or fallback)
    return prismaClient || fallbackClient || createPrismaFallback()
}

// For backwards compatibility - return proxy that initializes on first use
export const prisma = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getPrismaClient()
        return (client as any)[prop]
    }
})

export default prisma
