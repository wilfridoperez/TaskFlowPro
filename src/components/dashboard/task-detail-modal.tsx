'use client'

import { useState } from 'react'
import { X, Save, Trash2 } from 'lucide-react'

interface Task {
    id: string
    title: string
    description?: string
    status: string
    priority: string
    startDate?: Date | string
    dueDate?: Date | string
    assignedTo: string
    dependsOn?: string[]
}

interface User {
    id: string
    name: string
    email: string
    avatar: string
}

interface TaskDetailModalProps {
    task: Task
    allTasks: Task[]
    users: User[]
    isOpen: boolean
    onClose: () => void
    onSave: (updates: Partial<Task>) => void
}

export default function TaskDetailModal({
    task,
    allTasks,
    users,
    isOpen,
    onClose,
    onSave
}: TaskDetailModalProps) {
    const [editedTask, setEditedTask] = useState<Partial<Task>>(task)
    const [hasChanges, setHasChanges] = useState(false)

    const handleChange = (field: string, value: any) => {
        setEditedTask(prev => ({
            ...prev,
            [field]: value
        }))
        setHasChanges(true)
    }

    const handleSave = () => {
        onSave(editedTask)
        setHasChanges(false)
    }

    const handleClose = () => {
        if (hasChanges) {
            if (confirm('You have unsaved changes. Discard them?')) {
                setEditedTask(task)
                setHasChanges(false)
                onClose()
            }
        } else {
            onClose()
        }
    }

    if (!isOpen) return null

    const otherTasks = allTasks.filter(t => t.id !== task.id)
    const selectedDeps = editedTask.dependsOn || []

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-700 hover:text-gray-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title
                        </label>
                        <input
                            type="text"
                            value={editedTask.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={editedTask.description || ''}
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
                            value={editedTask.status || 'TODO'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                        </label>
                        <select
                            value={editedTask.priority || 'MEDIUM'}
                            onChange={(e) => handleChange('priority', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    {/* Start Date & Due Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={editedTask.startDate ? new Date(editedTask.startDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value) : null)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Assigned To */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assigned To
                        </label>
                        <select
                            value={editedTask.assignedTo || ''}
                            onChange={(e) => handleChange('assignedTo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                            <option value="">Unassigned</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dependencies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Depends On (Select tasks this one depends on)
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                            {otherTasks.length === 0 ? (
                                <p className="text-sm text-gray-700">No other tasks in this project</p>
                            ) : (
                                otherTasks.map(depTask => (
                                    <label key={depTask.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedDeps.includes(depTask.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleChange('dependsOn', [...selectedDeps, depTask.id])
                                                } else {
                                                    handleChange('dependsOn', selectedDeps.filter(id => id !== depTask.id))
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{depTask.title}</p>
                                            <p className="text-xs text-gray-700">{depTask.status.replace('_', ' ').toLowerCase()}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                    <button
                        onClick={() => {
                            if (confirm('Delete this task?')) {
                                // Handle delete
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
