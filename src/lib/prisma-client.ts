import { PrismaClient } from '@prisma/client'

// Global instance to avoid multiple connections
declare global {
    var prismaInstance: PrismaClient | undefined
}

let prismaClient: PrismaClient | null = null

// Lazy initialize Prisma client only when actually needed
export function getPrismaClient(): PrismaClient {
    if (!prismaClient) {
        console.log('Initializing Prisma client...')
        try {
            prismaClient = new PrismaClient({
                log: ['query'],
                errorFormat: 'pretty',
            })
        } catch (error) {
            console.error('Failed to initialize Prisma client:', error)
            // Return a stub that won't crash the app
            throw error
        }
    }
    return prismaClient
}

// For backwards compatibility
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrismaClient()
        return (client as any)[prop]
    }
})

export default prisma
