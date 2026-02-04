'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllProjects } from "@/lib/data"
import ProjectGridItem from "./project-grid-item"
import { Search, X, ChevronDown } from "lucide-react"

export function ProjectGrid() {
    const [projects, setProjects] = useState<any[]>([])
    const [filteredProjects, setFilteredProjects] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [isLoading, setIsLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(true)

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const allProjects = await getAllProjects()
                setProjects(allProjects.slice(0, 10)) // Increased from 3 to 10 for filtering
            } catch (error) {
                console.error('Failed to load projects:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadProjects()
    }, [])

    useEffect(() => {
        let filtered = projects

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(project => project.status === statusFilter)
        }

        setFilteredProjects(filtered)
    }, [projects, searchQuery, statusFilter])

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Recent Projects
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                            title={showFilters ? "Hide filters" : "Show filters"}
                        >
                            <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <Link
                            href="/dashboard/projects"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View all
                        </Link>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                {showFilters && (
                    <div className="flex gap-3 mb-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-700"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-max text-gray-900"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ON_HOLD">On Hold</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {isLoading ? (
                        <li className="px-4 py-4 sm:px-6">
                            <p className="text-gray-500">Loading projects...</p>
                        </li>
                    ) : filteredProjects.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6">
                            <p className="text-gray-500">
                                {projects.length === 0
                                    ? 'No projects yet. '
                                    : 'No projects match your filters. '
                                }
                                <Link href="/dashboard/projects/new" className="text-blue-600 hover:text-blue-700">
                                    Create one
                                </Link>
                            </p>
                        </li>
                    ) : (
                        filteredProjects.map((project) => (
                            <ProjectGridItem key={project.id} project={project} />
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}