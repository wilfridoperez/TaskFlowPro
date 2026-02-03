'use server'

/**
 * Data Layer Module - Read-Only Operations
 * 
 * Centralized data access layer for the application using Prisma ORM.
 * All READ operations go here (these are client-safe).
 * For CREATE/UPDATE/DELETE operations, see actions.ts
 */

import { prisma } from './prisma-client'

// Helper function to convert Prisma Task to our Task format
function formatTask(task: any) {
    return {
        ...task,
        assignedTo: task.assigneeId,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        dependsOn: task.dependsOn ? task.dependsOn.split(',').filter(Boolean) : [],
    }
}

// Helper function to convert Prisma Project to our Project format
function formatProject(project: any, tasks: any[] = []) {
    return {
        ...project,
        userId: project.ownerId,
        teamMembers: project.teamMemberIds ? project.teamMemberIds.split(',').filter(Boolean) : [],
        tasks: tasks.map(formatTask),
        _count: { tasks: tasks.length },
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
    }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get all users
 */
export const getUsers = async () => {
    const users = await prisma.user.findMany()
    return users.map(u => ({
        id: u.id,
        name: u.name || 'User',
        email: u.email,
        avatar: u.image || '',
    }))
}

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return null
    return {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        avatar: user.image || '',
    }
}

/**
 * Get multiple users by IDs
 */
export const getUsersByIds = async (ids: string[]) => {
    const users = await prisma.user.findMany({
        where: { id: { in: ids } }
    })
    return users.map(u => ({
        id: u.id,
        name: u.name || 'User',
        email: u.email,
        avatar: u.image || '',
    }))
}

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null
    return {
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        avatar: user.image || '',
    }
}

// ============================================================================
// PROJECT OPERATIONS
// ============================================================================

/**
 * Get all projects with their associated tasks
 */
export const getAllProjects = async () => {
    const projects = await prisma.project.findMany({
        include: { tasks: true },
        orderBy: { updatedAt: 'desc' }
    })
    return projects.map(p => formatProject(p, p.tasks))
}

/**
 * Get a single project by ID with its tasks
 */
export const getProject = async (id: string) => {
    console.log(`[DATA] getProject called with ID: ${id}`)

    const project = await prisma.project.findUnique({
        where: { id },
        include: { tasks: true }
    })

    console.log(`[DATA] Project found:`, !!project)

    if (!project) return null
    return formatProject(project, project.tasks)
}

/**
 * Get projects by user ID
 */
export const getProjectsByUserId = async (userId: string) => {
    const projects = await prisma.project.findMany({
        where: { ownerId: userId },
        include: { tasks: true },
        orderBy: { updatedAt: 'desc' }
    })
    return projects.map(p => formatProject(p, p.tasks))
}

// ============================================================================
// TASK OPERATIONS
// ============================================================================

/**
 * Get all tasks
 */
export const getAllTasks = async () => {
    const tasks = await prisma.task.findMany({
        include: { project: true },
        orderBy: { updatedAt: 'desc' }
    })
    return tasks.map((task) => ({
        ...formatTask(task),
        projectName: task.project?.name || null
    }))
}

/**
 * Get a single task by ID
 */
export const getTask = async (id: string) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            project: {
                select: { id: true, name: true }
            }
        }
    })
    if (!task) return null
    return formatTask(task)
}

/**
 * Get tasks by multiple IDs
 */
export const getTasksByIds = async (ids: string[]) => {
    const tasks = await prisma.task.findMany({
        where: { id: { in: ids } }
    })
    return tasks.map(formatTask)
}

/**
 * Get all tasks in a project
 */
export const getTasksInProject = async (projectId: string) => {
    const tasks = await prisma.task.findMany({
        where: { projectId }
    })
    return tasks.map(formatTask)
}

/**
 * Get tasks assigned to a user
 */
export const getTasksByAssignee = async (userId: string) => {
    const tasks = await prisma.task.findMany({
        where: { assigneeId: userId }
    })
    return tasks.map(formatTask)
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (userId: string) => {
    const userProjects = await prisma.project.findMany({
        where: { ownerId: userId }
    })
    const projectIds = userProjects.map(p => p.id)

    const userTasks = await prisma.task.findMany({
        where: { projectId: { in: projectIds } }
    })

    const now = new Date()
    const completedTasks = userTasks.filter(t => t.status === 'DONE').length
    const inProgressTasks = userTasks.filter(t => t.status === 'IN_PROGRESS').length
    const overdueTasks = userTasks.filter(t => {
        return t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    }).length

    return {
        totalProjects: userProjects.length,
        activeProjects: userProjects.filter(p => p.status === 'ACTIVE').length,
        totalTasks: userTasks.length,
        completedTasks,
        inProgressTasks,
        overdueTasks
    }
}

/**
 * Get recent projects (latest created/updated)
 */
export const getRecentProjects = async (userId: string, limit: number = 5) => {
    const projects = await prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: { tasks: true }
    })
    return projects.map(p => formatProject(p, p.tasks))
}

/**
 * Get recent tasks (latest created/updated)
 */
export const getRecentTasks = async (userId: string, limit: number = 10) => {
    // Get user's projects first
    const userProjects = await prisma.project.findMany({
        where: { ownerId: userId }
    })
    const projectIds = userProjects.map(p => p.id)

    // Then get tasks from those projects
    const tasks = await prisma.task.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { updatedAt: 'desc' },
        take: limit
    })
    return tasks.map(formatTask)
}

// ============================================================================
// ALLOCATION OPERATIONS
// ============================================================================

/**
 * Get all allocations for a project
 */
export const getAllocations = async (projectId: string) => {
    const allocations = await prisma.allocation.findMany({
        where: { projectId },
        include: {
            teamMember: {
                include: {
                    user: true
                }
            }
        },
        orderBy: [
            { teamMemberId: 'asc' },
            { month: 'asc' }
        ]
    })
    return allocations
}

/**
 * Get allocation for a specific team member and month
 */
export const getAllocation = async (projectId: string, teamMemberId: string, month: string) => {
    const allocation = await prisma.allocation.findUnique({
        where: {
            projectId_teamMemberId_month: {
                projectId,
                teamMemberId,
                month
            }
        }
    })
    return allocation
}

/**
 * Get allocations formatted for the monthly allocations editor component
 * Returns allocations in the format: memberIndex -> month -> percentage
 */
export const getFormattedAllocations = async (projectId: string) => {
    // Get all allocations
    const allocations = await getAllocations(projectId)

    // Get team members in order
    const teamMembers = await getProjectTeamMembers(projectId)

    // Create a map of teamMemberId to memberIndex
    const memberIndexMap = teamMembers.reduce((acc, member, index) => {
        acc[member.id] = index
        return acc
    }, {} as Record<string, number>)

    // Transform allocations to the component format
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const formattedAllocations: Record<number, Record<string, number>> = {}

    // Initialize all members with 0s for all months
    teamMembers.forEach((_, index) => {
        formattedAllocations[index] = {}
        months.forEach(month => {
            formattedAllocations[index][month] = 0
        })
    })

    // Fill in actual allocations from database
    allocations.forEach(allocation => {
        const memberIndex = memberIndexMap[allocation.teamMemberId]
        if (memberIndex !== undefined) {
            formattedAllocations[memberIndex][allocation.month] = allocation.percentage
        }
    })

    return formattedAllocations
}

// ============================================================================
// TEAM MEMBER OPERATIONS
// ============================================================================

/**
 * Get all team members for a project with their user information
 */
export const getProjectTeamMembers = async (projectId: string) => {
    const teamMembers = await prisma.teamMember.findMany({
        where: { projectId },
        include: {
            user: true
        },
        orderBy: { joinedAt: 'asc' }
    })

    return teamMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        name: member.user.name || member.user.email,
        email: member.user.email,
        role: member.role
    }))
}
