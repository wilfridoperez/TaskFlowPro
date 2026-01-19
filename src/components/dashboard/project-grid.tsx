import Link from "next/link"
import { Calendar, Users, MoreVertical } from "lucide-react"
import { getAllProjects } from "@/lib/data"

export async function ProjectGrid() {
    const projects = (await getAllProjects()).slice(0, 3)

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Projects
                </h3>
                <Link
                    href="/dashboard/projects"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View all
                </Link>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {projects.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6">
                            <p className="text-gray-500">No projects yet. <Link href="/dashboard/projects/new" className="text-blue-600 hover:text-blue-700">Create one</Link></p>
                        </li>
                    ) : (
                        projects.map((project) => {
                            const completedTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0
                            const totalTasks = project.tasks?.length || 0
                            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                            return (
                            <li key={project.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                                <Link href={`/dashboard/projects/${project.id}`}>
                                                    {project.name}
                                                </Link>
                                            </h4>
                                            <button className="text-gray-400 hover:text-gray-500">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {project.description}
                                        </p>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <span className="mr-4">Due {project.endDate?.toLocaleDateString() || 'N/A'}</span>
                                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                            <span>{project.teamMembers?.length || 0} members</span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {completedTasks}/{totalTasks} tasks completed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            )
                        })
                    )}
                </ul>
            </div>
        </div>
    )
}