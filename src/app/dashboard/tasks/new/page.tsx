import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getUsers, getTasksInProject, getProject } from "@/lib/data"
import TaskFormClient from "@/components/dashboard/task-form-client"

export default async function NewTaskPage({
    searchParams
}: {
    searchParams: Promise<{ projectId?: string }>
}) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const { projectId } = await searchParams

    if (!projectId) {
        redirect("/dashboard")
    }

    const users = await getUsers()
    const projectTasks = await getTasksInProject(projectId)
    const project = await getProject(projectId)
    const projectTeamMembers = project?.teamMembers || []

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center">
                    <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Project
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Task</h1>
                    <TaskFormClient
                        projectId={projectId}
                        users={users}
                        projectTasks={projectTasks}
                        projectTeamMembers={projectTeamMembers}
                    />
                </div>
            </div>
        </div>
    )
}