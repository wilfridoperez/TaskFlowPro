import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Plus, Calendar, Users, MoreVertical } from "lucide-react"
import Link from "next/link"
import { getAllProjects } from "@/lib/data"

export default async function ProjectsPage() {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const projects = await getAllProjects()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800'
            case 'IN_REVIEW':
                return 'bg-yellow-100 text-yellow-800'
            case 'PLANNING':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
                    </div>
                    <Link
                        href="/dashboard/projects/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Project
                    </Link>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No projects yet. Create one to get started!</p>
                        </div>
                    ) : (
                        projects.map((project) => {
                            const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0
                            const totalTasks = project.tasks?.length || 0
                            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                            return (
                                <div key={project.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                <Link
                                                    href={`/dashboard/projects/${project.id}`}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    {project.name}
                                                </Link>
                                            </h3>
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="mb-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ').toLowerCase()}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Project Details */}
                                        <div className="space-y-2 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span>Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2" />
                                                <span>{project.teamMembers?.length || 0} team members</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-green-600 font-medium">
                                                    ${(project.budget || 0).toLocaleString()} budget
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}