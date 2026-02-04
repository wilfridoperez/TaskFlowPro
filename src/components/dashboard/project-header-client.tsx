'use client'

import { useState } from 'react'
import { Calendar, DollarSign, Users, CheckCircle, Edit2 } from 'lucide-react'
import ProjectEditModal from './project-edit-modal'
import { updateProject } from '@/lib/actions'

interface ProjectHeaderClientProps {
    project: any
    completedTasks: number
    totalTasks: number
}

export default function ProjectHeaderClient({ project, completedTasks, totalTasks }: ProjectHeaderClientProps) {
    const [editingProject, setEditingProject] = useState(project)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const handleSaveProject = async (updates: any) => {
        setIsSaving(true)
        try {
            const updated = await updateProject(project.id, updates)
            if (updated) {
                setEditingProject(updated)
                setIsModalOpen(false)
                // Reload the page to refresh data
                window.location.reload()
            }
        } catch (error) {
            console.error('Error updating project:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden transition-all duration-300">
                {/* Ultra-Compact Single Row Header */}
                <div className="p-3 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                        {/* Left: Project Name + Status + Description */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="min-w-0">
                                <h1 className="text-lg font-bold text-gray-900 truncate">{editingProject.name}</h1>
                                {editingProject.description && (
                                    <p className="text-xs text-gray-500 truncate">{editingProject.description}</p>
                                )}
                            </div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${editingProject.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                editingProject.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {editingProject.status ? editingProject.status.charAt(0) + editingProject.status.slice(1).toLowerCase() : 'UNKNOWN'}
                            </span>
                        </div>

                        {/* Center: 5 Stats (Ultra-Compact Inline) */}
                        <div className="flex items-center gap-2 flex-wrap text-xs flex-shrink-0">
                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 text-xs">{editingProject.startDate ? new Date(editingProject.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 text-xs">{editingProject.endDate ? new Date(editingProject.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <DollarSign className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 text-xs">${editingProject.budget ? (editingProject.budget / 1000).toFixed(0) + 'K' : '0'}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <Users className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 text-xs">{editingProject.teamMembers?.length || 0}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-300"></div>
                            <div className="flex items-center gap-0.5 whitespace-nowrap">
                                <CheckCircle className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                <span className="text-gray-600 text-xs">{totalTasks > 0 ? `${progressPercentage}%` : '0%'}</span>
                            </div>
                        </div>

                        {/* Right: Progress Bar + Buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {totalTasks > 0 && (
                                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                    <div
                                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            )}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                                <Edit2 className="w-3 h-3" />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
            <ProjectEditModal
                project={editingProject}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
            />
        </>
    )
}
