'use client'

import { useState } from 'react'
import { Grid3X3, List, Edit2 } from 'lucide-react'
import Link from 'next/link'

interface Project {
    id: string
    name: string
    description?: string
    status: string
    budget?: number
    endDate?: Date | string
    teamMembers?: any[]
    tasks?: any[]
}

interface ProjectViewSelectorClientProps {
    projects: Project[]
}

export default function ProjectViewSelectorClient({ projects }: ProjectViewSelectorClientProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

    const ProjectCard = ({ project }: { project: Project }) => {
        const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0
        const totalTasks = project.tasks?.length || 0
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return (
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            <a
                                href={`/dashboard/projects/${project.id}`}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {project.name}
                            </a>
                        </h3>
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
                    <div className="text-sm text-gray-500">
                        <div className="flex items-center mb-2">
                            <span>Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center mb-2">
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
    }

    const ProjectRow = ({ project }: { project: Project }) => {
        const completedTasks = project.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0
        const totalTasks = project.tasks?.length || 0
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return (
            <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <a
                        href={`/dashboard/projects/${project.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        {project.name}
                    </a>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toLowerCase()}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="w-40">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    {project.teamMembers?.length || 0}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ${(project.budget || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                    <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                </td>
            </tr>
        )
    }

    return (
        <>
            {/* View Mode Selector */}
            <div className="mb-6 flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <span className="text-gray-700 font-medium">View:</span>
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    title="Grid View"
                >
                    <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    title="List View"
                >
                    <List className="w-5 h-5" />
                </button>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No projects yet. Create one to get started!</p>
                        </div>
                    ) : (
                        projects.map((project) => <ProjectCard key={project.id} project={project} />)
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {projects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No projects yet. Create one to get started!</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Project Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Team
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Budget
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <ProjectRow key={project.id} project={project} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </>
    )
}
