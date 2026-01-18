'use client'

import { useState } from 'react'
import { Trash2, Edit2, Plus } from 'lucide-react'

interface TaskStatus {
    id: string
    name: string
    color: string
    description: string
    isDefault: boolean
}

export default function StatusesManagement() {
    const [statuses, setStatuses] = useState<TaskStatus[]>([
        { id: '1', name: 'To Do', color: 'bg-gray-600', description: 'Task not started', isDefault: true },
        { id: '2', name: 'In Progress', color: 'bg-blue-500', description: 'Task is being worked on', isDefault: false },
        { id: '3', name: 'Completed', color: 'bg-green-500', description: 'Task is completed', isDefault: false },
    ])

    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', color: 'bg-gray-600', description: '', isDefault: false })
    const [editingId, setEditingId] = useState<string | null>(null)

    const colorOptions = [
        { value: 'bg-gray-600', label: 'Gray' },
        { value: 'bg-red-500', label: 'Red' },
        { value: 'bg-orange-500', label: 'Orange' },
        { value: 'bg-yellow-500', label: 'Yellow' },
        { value: 'bg-green-500', label: 'Green' },
        { value: 'bg-blue-500', label: 'Blue' },
        { value: 'bg-purple-500', label: 'Purple' },
        { value: 'bg-pink-500', label: 'Pink' },
    ]

    const handleAddStatus = () => {
        if (formData.name) {
            if (editingId) {
                setStatuses(statuses.map(s => s.id === editingId ? { ...s, ...formData } : s))
                setEditingId(null)
            } else {
                const newStatus: TaskStatus = {
                    id: Math.random().toString(),
                    ...formData
                }
                setStatuses([...statuses, newStatus])
            }
            setFormData({ name: '', color: 'bg-gray-400', description: '', isDefault: false })
            setShowForm(false)
        }
    }

    const handleEdit = (status: TaskStatus) => {
        setFormData(status)
        setEditingId(status.id)
        setShowForm(true)
    }

    const handleDelete = (id: string) => {
        setStatuses(statuses.filter(s => s.id !== id))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Task Statuses</h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm)
                        setEditingId(null)
                        setFormData({ name: '', color: 'bg-gray-600', description: '', isDefault: false })
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Status
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Status' : 'New Status'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., In Review"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Description for this status"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <div className="grid grid-cols-4 gap-2">
                                {colorOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setFormData({ ...formData, color: option.value })}
                                        className={`${option.value} w-12 h-12 rounded-lg border-2 ${formData.color === option.value ? 'border-gray-900' : 'border-transparent'
                                            } hover:border-gray-400`}
                                        title={option.label}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                Set as default status
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddStatus}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                {editingId ? 'Update Status' : 'Create Status'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingId(null)
                                    setFormData({ name: '', color: 'bg-gray-600', description: '', isDefault: false })
                                }}
                                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statuses.map((status) => (
                    <div key={status.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`${status.color} w-4 h-4 rounded`}></div>
                                    <h3 className="font-semibold text-gray-900">{status.name}</h3>
                                </div>
                                <p className="text-sm text-gray-600">{status.description}</p>
                            </div>
                            {status.isDefault && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    Default
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => handleEdit(status)}
                                className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(status.id)}
                                className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
