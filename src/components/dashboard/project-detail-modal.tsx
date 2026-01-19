'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { updateProject } from '@/lib/actions'

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

interface ProjectDetailModalProps {
    project: Project
    isOpen: boolean
    onClose: () => void
}

export default function ProjectDetailModal({
    project,
    isOpen,
    onClose,
}: ProjectDetailModalProps) {
    const [editedProject, setEditedProject] = useState<Partial<Project>>(project)
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleChange = (field: string, value: any) => {
        setEditedProject(prev => ({
            ...prev,
            [field]: value
        }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const updates = {
                name: editedProject.name,
                description: editedProject.description,
                status: editedProject.status,
                budget: editedProject.budget ? parseInt(editedProject.budget.toString()) : 0,
                endDate: editedProject.endDate,
            }
            await updateProject(project.id, updates)
            setHasChanges(false)
            setTimeout(() => {
                onClose()
            }, 300)
        } catch (error) {
            console.error('Error saving project:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        if (hasChanges) {
            if (confirm('You have unsaved changes. Discard them?')) {
                setEditedProject(project)
                setHasChanges(false)
                onClose()
            }
        } else {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-700 hover:text-gray-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={editedProject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={editedProject.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={editedProject.status || 'PLANNING'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                            <option value="PLANNING">Planning</option>
                            <option value="ACTIVE">Active</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Budget & End Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Budget ($)
                            </label>
                            <input
                                type="number"
                                value={editedProject.budget || ''}
                                onChange={(e) => handleChange('budget', e.target.value ? parseInt(e.target.value) : 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={editedProject.endDate ? new Date(editedProject.endDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Team Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Members
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                            {project.teamMembers && project.teamMembers.length > 0 ? (
                                <div>
                                    <p className="text-sm font-medium mb-2">{project.teamMembers.length} members</p>
                                    <ul className="space-y-1">
                                        {project.teamMembers.map((member: any) => (
                                            <li key={member.id} className="text-sm text-gray-600">
                                                {member.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No team members assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Tasks Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tasks
                        </label>
                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                            {project.tasks && project.tasks.length > 0 ? (
                                <div>
                                    <p className="text-sm font-medium mb-2">{project.tasks.length} total tasks</p>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Completed: {project.tasks.filter((t: any) => t.status === 'COMPLETED').length}</p>
                                        <p>In Progress: {project.tasks.filter((t: any) => t.status === 'IN_PROGRESS').length}</p>
                                        <p>To Do: {project.tasks.filter((t: any) => t.status === 'TODO').length}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No tasks yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg sticky bottom-0">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${hasChanges && !isSaving
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
