"use server"

import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "./prisma-client"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (!email || !password) {
            return "Missing email or password"
        }

        await signIn("credentials", {
            email,
            password,
            redirect: false
        })

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials"
                default:
                    return "Something went wrong"
            }
        }
        return "Authentication failed"
    }

    redirect("/dashboard")
}

// ============================================================================
// PROJECT MUTATIONS
// ============================================================================

export const createProject = async (projectData: {
    name: string
    description: string
    startDate: string
    endDate: string
    budget: string
    userId: string
    teamMembers?: string[]
}) => {
    console.log('[DEBUG] createProject called with:', projectData)

    // Set default dates if not provided
    const startDate = projectData.startDate ? new Date(projectData.startDate) : new Date()
    const endDate = projectData.endDate ? new Date(projectData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const budget = projectData.budget ? parseFloat(projectData.budget) : 0

    const newProject = await prisma.project.create({
        data: {
            name: projectData.name,
            description: projectData.description,
            status: "ACTIVE",
            startDate,
            endDate,
            budget,
            ownerId: projectData.userId,
            teamMemberIds: (projectData.teamMembers || []).join(','),
        }
    })

    console.log('[DEBUG] Project created:', newProject)

    // Revalidate the projects page to show the new project
    revalidatePath('/dashboard/projects', 'layout')

    return newProject
}

export const updateProject = async (projectId: string, updates: any) => {
    const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
            ...updates,
            teamMemberIds: updates.teamMembers ? updates.teamMembers.join(',') : undefined,
        }
    })

    revalidatePath('/dashboard/projects', 'layout')
    return updated
}

export const deleteProject = async (projectId: string) => {
    // Delete all tasks in the project first (cascade is handled by Prisma)
    await prisma.project.delete({
        where: { id: projectId }
    })

    revalidatePath('/dashboard/projects', 'layout')
    return true
}

// ============================================================================
// TASK MUTATIONS
// ============================================================================

export const createTask = async (taskData: {
    title: string
    description: string
    priority: string
    startDate: string
    dueDate: string
    projectId: string
    assignedTo?: string | null
    dependsOn?: string[]
}) => {
    const startDate = taskData.startDate ? new Date(taskData.startDate) : new Date()
    const dueDate = taskData.dueDate ? new Date(taskData.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const newTask = await prisma.task.create({
        data: {
            title: taskData.title,
            description: taskData.description,
            status: "TODO",
            priority: taskData.priority,
            startDate,
            dueDate,
            projectId: taskData.projectId,
            assigneeId: taskData.assignedTo || null,
            dependsOn: (taskData.dependsOn || []).join(','),
        }
    })

    console.log('[DEBUG] Task created:', newTask)

    // Revalidate both the projects list and the specific project detail page
    revalidatePath('/dashboard/projects', 'layout')
    revalidatePath(`/dashboard/projects/${taskData.projectId}`, 'layout')

    return newTask
}

export const updateTaskById = async (taskId: string, updates: any) => {
    const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
            ...updates,
            dependsOn: updates.dependsOn ? updates.dependsOn.join(',') : undefined,
        }
    })

    revalidatePath('/dashboard/projects', 'layout')
    return updated
}

export const updateTaskStatus = async (taskId: string, status: string) => {
    return updateTaskById(taskId, { status })
}

export const updateTaskDependencies = async (taskId: string, dependsOn: string[]) => {
    return updateTaskById(taskId, { dependsOn })
}

export const deleteTask = async (taskId: string) => {
    await prisma.task.delete({
        where: { id: taskId }
    })

    revalidatePath('/dashboard/projects', 'layout')
    return true
}