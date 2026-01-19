'use client'

import { useState, useMemo } from 'react'
import { Grid3X3, List, Edit2, Filter, ChevronUp, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import ProjectDetailModal from './project-detail-modal'

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
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>('ALL')
    const [filterMinBudget, setFilterMinBudget] = useState<string>('')
    const [filterMaxBudget, setFilterMaxBudget] = useState<string>('')
    const [filterTeamSize, setFilterTeamSize] = useState<string>('ALL')
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

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

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            if (filterStatus !== 'ALL' && project.status !== filterStatus) return false

            const minBudget = filterMinBudget ? parseInt(filterMinBudget) : 0
            const maxBudget = filterMaxBudget ? parseInt(filterMaxBudget) : Infinity
            const projectBudget = project.budget || 0
            if (projectBudget < minBudget || projectBudget > maxBudget) return false

            const teamSize = project.teamMembers?.length || 0
            if (filterTeamSize !== 'ALL') {
                if (filterTeamSize === '0' && teamSize > 0) return false
                if (filterTeamSize === '1-3' && (teamSize < 1 || teamSize > 3)) return false
                if (filterTeamSize === '4-7' && (teamSize < 4 || teamSize > 7)) return false
                if (filterTeamSize === '8+' && teamSize < 8) return false
            }

            return true
        })
    }, [projects, filterStatus, filterMinBudget, filterMaxBudget, filterTeamSize])

    const ProjectCard = ({ project }: { project: Project }) => {
        const completedTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0
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
                    <div className="text-sm text-gray-500 mb-4">
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

                    {/* Edit Button */}
                    <button
                        onClick={() => setSelectedProject(project)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                </div>
            </div>
        )
    }

    const ProjectRow = ({ project }: { project: Project }) => {
        const completedTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0
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
                    <button
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </button>
                </td>
            </tr>
        )
    }

    return (
        <>
            {/* Filter Toggle */}
            <div className="mb-6 border border-gray-300 rounded-lg bg-white">
                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Filters</span>
                        {(filterStatus !== 'ALL' || filterMinBudget || filterMaxBudget || filterTeamSize !== 'ALL') && (
                            <div className="flex items-center gap-2 ml-4">
                                {filterStatus !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        {filterStatus}
                                    </span>
                                )}
                                {(filterMinBudget || filterMaxBudget) && (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        ${filterMinBudget || '0'} - ${filterMaxBudget || '∞'}
                                    </span>
                                )}
                                {filterTeamSize !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        Team: {filterTeamSize}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {filterOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {/* Filter Dropdowns */}
                {filterOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 grid grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget ($)</label>
                            <input
                                type="number"
                                value={filterMinBudget}
                                onChange={(e) => setFilterMinBudget(e.target.value)}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget ($)</label>
                            <input
                                type="number"
                                value={filterMaxBudget}
                                onChange={(e) => setFilterMaxBudget(e.target.value)}
                                placeholder="No limit"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                            <select
                                value={filterTeamSize}
                                onChange={(e) => setFilterTeamSize(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="ALL">All Sizes</option>
                                <option value="0">No Team</option>
                                <option value="1-3">1-3 Members</option>
                                <option value="4-7">4-7 Members</option>
                                <option value="8+">8+ Members</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

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
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">No projects match your filters. Try adjusting them!</p>
                        </div>
                    ) : (
                        filteredProjects.map((project) => <ProjectCard key={project.id} project={project} />)
                    )}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {filteredProjects.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No projects match your filters. Try adjusting them!</p>
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
                                {filteredProjects.map((project) => (
                                    <ProjectRow key={project.id} project={project} />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            {/* Project Detail Modal */}
            {selectedProject && (
                <ProjectDetailModal
                    project={selectedProject}
                    isOpen={!!selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}        </>
    )
}
