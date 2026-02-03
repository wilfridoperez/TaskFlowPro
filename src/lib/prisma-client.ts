import { PrismaClient } from '@prisma/client'

// Global instance to avoid multiple connections
declare global {
    var prismaInstance: PrismaClient | undefined
}

let prismaClient: PrismaClient | null = null
let initPromise: Promise<PrismaClient> | null = null

// Lazy initialize Prisma client only when actually needed
export function getPrismaClient(): PrismaClient {
    if (!prismaClient) {
        console.log('Initializing Prisma client...')
        try {
            prismaClient = new PrismaClient({
                log: [],
                errorFormat: 'pretty',
            })
            // Don't wait for connection - let it happen asynchronously
            prismaClient.$connect().catch(err => {
                console.error('Prisma connection error (will retry on query):', err.message)
            })
        } catch (error) {
            console.error('Failed to initialize Prisma client:', error)
            throw error
        }
    }
    return prismaClient
}

// Backward compatibility - return proxy that initializes on first use
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrismaClient()
        return (client as any)[prop]
    }
})

export default prisma
