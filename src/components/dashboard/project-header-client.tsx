'use client'

import { useState } from 'react'
import { Calendar, DollarSign, Users, CheckCircle, Clock, Edit2 } from 'lucide-react'
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
            const updated = updateProject(project.id, updates)
            if (updated) {
                setEditingProject(updated)
                setIsModalOpen(false)
            }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{editingProject.name}</h1>
                        <p className="text-gray-600">{editingProject.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center gap-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${editingProject.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            editingProject.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {editingProject.status.charAt(0) + editingProject.status.slice(1).toLowerCase()}
                        </span>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                    </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                            <p className="text-sm text-gray-700">Start Date</p>
                            <p className="font-medium text-gray-900">{editingProject.startDate ? new Date(editingProject.startDate).toLocaleDateString() : 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                            <p className="text-sm text-gray-700">End Date</p>
                            <p className="font-medium text-gray-900">{editingProject.endDate ? new Date(editingProject.endDate).toLocaleDateString() : 'Not set'}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                            <p className="text-sm text-gray-700">Budget</p>
                            <p className="font-medium text-gray-900">${editingProject.budget ? editingProject.budget.toLocaleString() : '0'}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-gray-600 mr-2" />
                        <div>
                            <p className="text-sm text-gray-700">Progress</p>
                            <p className="font-medium text-gray-900">{progressPercentage}% ({completedTasks}/{totalTasks})</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {totalTasks > 0 && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
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
