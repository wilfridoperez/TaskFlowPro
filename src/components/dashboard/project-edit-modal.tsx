'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Users } from 'lucide-react'
import { getUsers } from '@/lib/data'

interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

interface Project {
    id: string
    name: string
    description: string
    status: string
    startDate: Date
    endDate: Date
    budget: number
    teamMembers?: string[]
}

interface ProjectEditModalProps {
    project: Project
    isOpen: boolean
    onClose: () => void
    onSave: (updates: any) => Promise<void>
}

export default function ProjectEditModal({ project, isOpen, onClose, onSave }: ProjectEditModalProps) {
    const [editedProject, setEditedProject] = useState<Project>({
        ...project,
        teamMembers: project.teamMembers || []
    })
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [loadingUsers, setLoadingUsers] = useState(true)

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await getUsers()
                setAllUsers(users)
            } catch (error) {
                console.error('Failed to load users:', error)
            } finally {
                setLoadingUsers(false)
            }
        }

        loadUsers()
    }, [])

    const handleChange = (field: string, value: any) => {
        setEditedProject(prev => ({
            ...prev,
            [field]: value
        }))
        setHasChanges(true)
    }

    const handleTeamMemberToggle = (userId: string) => {
        const newTeamMembers = editedProject.teamMembers?.includes(userId)
            ? editedProject.teamMembers.filter(id => id !== userId)
            : [...(editedProject.teamMembers || []), userId]

        handleChange('teamMembers', newTeamMembers)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const updates = {
                name: editedProject.name,
                description: editedProject.description,
                status: editedProject.status,
                startDate: editedProject.startDate,
                endDate: editedProject.endDate,
                budget: editedProject.budget,
                teamMembers: editedProject.teamMembers || []
            }
            await onSave(updates)
            setHasChanges(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleClose = () => {
        if (hasChanges) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?')
            if (!confirmed) return
        }
        setEditedProject({
            ...project,
            teamMembers: project.teamMembers || []
        })
        setHasChanges(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-700 hover:text-gray-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Project Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={editedProject.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="Enter project name"
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
                            placeholder="Enter project description"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={editedProject.status || 'ACTIVE'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="PLANNING">Planning</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PAUSED">Paused</option>
                        </select>
                    </div>

                    {/* Start Date and End Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={editedProject.startDate ? new Date(editedProject.startDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChange('startDate', new Date(e.target.value))}
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
                                onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget ($)
                        </label>
                        <input
                            type="number"
                            value={editedProject.budget || 0}
                            onChange={(e) => handleChange('budget', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="0"
                            min="0"
                            step="1000"
                        />
                    </div>

                    {/* Team Members */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Project Team Members
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                            {loadingUsers ? (
                                <p className="text-sm text-gray-600">Loading team members...</p>
                            ) : allUsers.length > 0 ? (
                                allUsers.map(user => (
                                    <label key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={editedProject.teamMembers?.includes(user.id) || false}
                                            onChange={() => handleTeamMemberToggle(user.id)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-700">{user.email}</p>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p className="text-sm text-gray-600">No team members available</p>
                            )}
                        </div>
                        <p className="text-xs text-gray-700 mt-2">Selected: {editedProject.teamMembers?.length || 0} / {allUsers.length}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Project?</h3>
                            <p className="text-gray-600 mb-6">
                                This action cannot be undone. All tasks associated with this project will also be deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        // Delete functionality would go here
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
