import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Clock, Users } from "lucide-react"
import Link from "next/link"
import { getProject, getUsers } from "@/lib/data"
import ProjectHeaderClient from "@/components/dashboard/project-header-client"
import ProjectViewSelector from "@/components/dashboard/project-view-selector"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    console.log("ProjectDetailPage starting...")

    const session = await auth()
    console.log("Session:", !!session)

    if (!session) {
        console.log("No session, redirecting")
        redirect("/auth/signin")
    }

    // Await params to fix Next.js 15+ async issue
    const { id: projectId } = await params
    console.log("Project ID:", projectId)

    // Fetch project data from persistent storage
    let project = await getProject(projectId)
    console.log("Project found:", !!project)

    if (project) {
        console.log("Project details:", { id: project.id, name: project.name, taskCount: project.tasks?.length })
    }

    // If no project exists with this ID, create a mock project for demonstration
    if (!project) {
        console.log("No project found, creating mock data")
        project = {
            id: projectId,
            name: `Project #${projectId}`,
            description: `This is a demo project with ID ${projectId}. In a real application, this data would come from your database.`,
            status: 'ACTIVE' as const,
            startDate: new Date('2025-12-01'),
            endDate: new Date('2026-06-01'),
            budget: 100000,
            userId: session.user.id,
            teamMembers: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            tasks: [],
            _count: { tasks: 0 }
        }
    }

    // Type assertion to ensure project is not null after the if check
    const safeProject = project as NonNullable<typeof project>

    const completedTasks = safeProject.tasks.filter((task: any) => task.status === 'DONE').length
    const totalTasks = safeProject.tasks.length

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <Link
                        href={`/dashboard/projects/${projectId}/allocations`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        <Users className="w-4 h-4" />
                        View Allocations
                    </Link>
                </div>

                {/* Project Header with Edit Functionality */}
                <ProjectHeaderClient
                    project={safeProject}
                    completedTasks={completedTasks}
                    totalTasks={totalTasks}
                />

                {/* Tasks Section with View Selector */}
                <div className="bg-white rounded-lg shadow-sm mt-4">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <h2 className="text-base font-semibold text-gray-900">Tasks</h2>
                        <Link
                            href={`/dashboard/tasks/new?projectId=${projectId}`}
                            className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add Task
                        </Link>
                    </div>

                    {safeProject.tasks.length === 0 ? (
                        <div className="text-center py-6">
                            <Clock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <h3 className="text-sm font-medium text-gray-900">No tasks yet</h3>
                            <p className="text-xs text-gray-500 mt-1">Add your first task to get started</p>
                        </div>
                    ) : (
                        <div className="p-4">
                            <ProjectViewSelector
                                tasks={safeProject.tasks as any}
                                users={await getUsers()}
                                projectStartDate={safeProject.startDate}
                                projectEndDate={safeProject.endDate}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}