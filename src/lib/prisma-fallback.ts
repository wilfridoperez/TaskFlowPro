/**
 * Prisma Fallback Module
 * 
 * Provides mock data and safe fallback methods when Prisma database is unavailable.
 * This allows the app to start and serve content even if the database connection fails.
 */

import { MOCK_USERS, MOCK_PROJECTS, MOCK_TASKS } from "./mock-data"

// Create a fallback object that mimics Prisma client interface
export const createPrismaFallback = () => {
    return {
        user: {
            findUnique: async () => {
                console.log("[Prisma Fallback] Using mock user data")
                return MOCK_USERS[0] || null
            },
            findMany: async () => {
                console.log("[Prisma Fallback] Using mock users data")
                return MOCK_USERS
            },
            create: async ({ data }: any) => {
                console.log("[Prisma Fallback] Simulating user creation (not persisted)")
                return { id: "fallback-user-id", ...data }
            },
            update: async ({ data }: any) => {
                console.log("[Prisma Fallback] Simulating user update (not persisted)")
                return { id: "fallback-user-id", ...data }
            },
            count: async () => MOCK_USERS.length,
            upsert: async ({ create }: any) => ({ id: "fallback-id", ...create }),
        },
        project: {
            findUnique: async () => {
                console.log("[Prisma Fallback] Using mock project data")
                return MOCK_PROJECTS[0] || null
            },
            findMany: async () => {
                console.log("[Prisma Fallback] Using mock projects data")
                return MOCK_PROJECTS
            },
            create: async ({ data }: any) => {
                console.log("[Prisma Fallback] Simulating project creation (not persisted)")
                return { id: "fallback-project-id", ...data }
            },
            update: async ({ data }: any) => {
                console.log("[Prisma Fallback] Simulating project update (not persisted)")
                return { id: "fallback-project-id", ...data }
            },
            delete: async () => {
                console.log("[Prisma Fallback] Simulating project delete (not persisted)")
                return {}
            },
            upsert: async ({ create }: any) => ({ id: "fallback-id", ...create }),
        },
        task: {
            findUnique: async () => {
                console.log("[Prisma Fallback] Using mock task data")
                return MOCK_TASKS[0] || null
            },
            findMany: async () => {
                console.log("[Prisma Fallback] Using mock tasks data")
                return MOCK_TASKS
            },
            create: async ({ data }: any) => {
                console.log("[Prisma Fallback] Simulating task creation (not persisted)")
                return { id: "fallback-task-id", ...data }
            },
            update: async ({ data }: any) => {
                console.log("[Prisma Fallback] Simulating task update (not persisted)")
                return { id: "fallback-task-id", ...data }
            },
            delete: async () => {
                console.log("[Prisma Fallback] Simulating task delete (not persisted)")
                return {}
            },
            upsert: async ({ create }: any) => ({ id: "fallback-id", ...create }),
        },
        passwordReset: {
            findUnique: async () => null,
            create: async ({ data }: any) => ({ id: "fallback-id", ...data }),
            update: async ({ data }: any) => ({ id: "fallback-id", ...data }),
            delete: async () => ({}),
            upsert: async ({ create }: any) => ({ id: "fallback-id", ...create }),
        },
        $connect: async () => {
            console.log("[Prisma Fallback] $connect called")
        },
        $disconnect: async () => {
            console.log("[Prisma Fallback] $disconnect called")
        },
        $queryRaw: async () => {
            console.log("[Prisma Fallback] Query executed with fallback data")
            return []
        },
    } as any
}
