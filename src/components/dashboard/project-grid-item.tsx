'use client'

import { useState } from 'react'
import Link from "next/link"
import { Calendar, Users, MoreVertical, Edit2, Trash2, Eye } from "lucide-react"
import { deleteProject } from "@/lib/actions"

interface ProjectGridItemProps {
    project: any
}

export default function ProjectGridItem({ project }: ProjectGridItemProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const completedTasks = project.tasks?.filter((t: any) => t.status === 'DONE').length || 0
    const totalTasks = project.tasks?.length || 0
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            return
        }
        
        setIsDeleting(true)
        try {
            await deleteProject(project.id)
            window.location.reload()
        } catch (error) {
            console.error('Error deleting project:', error)
            alert('Failed to delete project')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <li key={project.id} className="px-4 py-4 sm:px-6 relative">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            <Link href={`/dashboard/projects/${project.id}`}>
                                {project.name}
                            </Link>
                        </h4>
                        <div className="relative">
                            <button 
                                onClick={() => setShowMenu(!showMenu)}
                                className="text-gray-400 hover:text-gray-500 p-1 rounded hover:bg-gray-100"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <>
                                    {/* Overlay to close menu */}
                                    <div 
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowMenu(false)}
                                    />
                                    
                                    {/* Menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-40 border border-gray-200">
                                        <Link
                                            href={`/dashboard/projects/${project.id}`}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg border-b border-gray-100"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <Eye className="w-4 h-4 mr-3" />
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                window.location.href = `/dashboard/projects/${project.id}`
                                            }}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                                        >
                                            <Edit2 className="w-4 h-4 mr-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                handleDelete()
                                            }}
                                            disabled={isDeleting}
                                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4 mr-3" />
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
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
}
