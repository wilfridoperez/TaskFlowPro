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
    // Extract teamMembers and remove from updates spread
    const { teamMembers, ...restUpdates } = updates

    const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
            ...restUpdates,
            teamMemberIds: teamMembers ? teamMembers.join(',') : undefined,
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
            priority: (taskData.priority as any) || "MEDIUM",
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
    // Only allow specific fields to be updated
    const allowedFields = ['title', 'description', 'status', 'priority', 'startDate', 'dueDate', 'estimatedHours', 'actualHours', 'tags', 'assigneeId', 'dependsOn']

    const filteredUpdates: any = {}

    for (const key of allowedFields) {
        if (key in updates) {
            // Handle dependsOn specially - convert array to comma-separated string
            if (key === 'dependsOn') {
                filteredUpdates.dependsOn = Array.isArray(updates.dependsOn) ? updates.dependsOn.join(',') : updates.dependsOn
            } else {
                filteredUpdates[key] = updates[key]
            }
        }
    }

    const updated = await prisma.task.update({
        where: { id: taskId },
        data: filteredUpdates
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

/**
 * Password Management Actions
 */

import bcrypt from 'bcryptjs'
import { sendEmail, generatePasswordChangedEmail, generatePasswordResetEmail } from './email'
import { auth } from './auth'

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    try {
        // Get user
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return { success: false, error: 'User not found' }
        }

        // Verify current password
        if (!user.password) {
            return { success: false, error: 'Your account does not have a password set' }
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
            return { success: false, error: 'Current password is incorrect' }
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        // Send notification email
        if (user.email) {
            const emailContent = generatePasswordChangedEmail(user.name || 'User')
            await sendEmail({
                to: user.email,
                ...emailContent,
            })
        }

        revalidatePath('/dashboard/settings', 'layout')
        return { success: true, message: 'Password changed successfully' }
    } catch (error) {
        console.error('Error changing password:', error)
        return { success: false, error: 'Failed to change password' }
    }
}

export const requestPasswordReset = async (email: string) => {
    try {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            // Don't reveal if email exists (security best practice)
            return { success: true, message: 'If an account exists, a reset link has been sent' }
        }

        // Generate reset token
        const token = require('crypto').randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 3600000) // 1 hour

        // Save reset token
        await prisma.passwordReset.create({
            data: {
                email,
                token,
                expires,
            }
        })

        // Send reset email
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`
        const emailContent = generatePasswordResetEmail(resetLink, user.name || 'User')
        await sendEmail({
            to: email,
            ...emailContent,
        })

        return { success: true, message: 'Password reset link sent to your email' }
    } catch (error) {
        console.error('Error requesting password reset:', error)
        return { success: false, error: 'Failed to process reset request' }
    }
}

export const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
        // Verify token
        const resetRecord = await prisma.passwordReset.findUnique({ where: { token } })
        if (!resetRecord || resetRecord.email !== email) {
            return { success: false, error: 'Invalid or expired reset link' }
        }

        if (new Date() > resetRecord.expires) {
            return { success: false, error: 'Reset link has expired' }
        }

        // Get user
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return { success: false, error: 'User not found' }
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        // Delete used reset token
        await prisma.passwordReset.delete({ where: { token } })

        // Send confirmation email
        const emailContent = generatePasswordChangedEmail(user.name || 'User')
        await sendEmail({
            to: email,
            ...emailContent,
        })

        return { success: true, message: 'Password has been reset successfully' }
    } catch (error) {
        console.error('Error resetting password:', error)
        return { success: false, error: 'Failed to reset password' }
    }
}