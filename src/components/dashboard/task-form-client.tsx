'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTask } from '@/lib/actions'

interface User {
    id: string
    name: string
    email: string
}

interface Task {
    id: string
    title: string
    status: string
}

interface TaskFormClientProps {
    projectId: string
    users: User[]
    projectTasks: Task[]
    projectTeamMembers: string[]
}

export default function TaskFormClient({
    projectId,
    users,
    projectTasks,
    projectTeamMembers
}: TaskFormClientProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        startDate: '',
        dueDate: '',
        assignedTo: '',
        dependsOn: [] as string[]
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === 'dependsOn' && e.target instanceof HTMLSelectElement) {
            const selected = Array.from(e.target.selectedOptions, option => option.value)
            setFormData(prev => ({ ...prev, dependsOn: selected }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent, createAnother: boolean = false) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            if (!formData.title.trim()) {
                setError('Task title is required')
                setIsSubmitting(false)
                return
            }

            if (!formData.startDate || !formData.dueDate) {
                setError('Start Date and Due Date are required')
                setIsSubmitting(false)
                return
            }

            // Create task
            await createTask({
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                startDate: formData.startDate,
                dueDate: formData.dueDate,
                projectId,
                assignedTo: formData.assignedTo || null,
                dependsOn: formData.dependsOn
            })

            if (createAnother) {
                // Reset form for creating another task
                setFormData({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    startDate: '',
                    dueDate: '',
                    assignedTo: '',
                    dependsOn: []
                })
                setError(null)
                // Show success message briefly
                setError('✅ Task created successfully! Create another below.')
                setTimeout(() => setError(null), 3000)
            } else {
                // Redirect back to project
                router.push(`/dashboard/projects/${projectId}`)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {error && (
                <div className={`p-4 rounded-lg ${
                    error.includes('✅')
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Task Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900 placeholder-gray-400"
                    placeholder="Enter task title"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900 placeholder-gray-400"
                    placeholder="Enter task description"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                        Assign To
                    </label>
                    <select
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                    >
                        <option value="">Unassigned</option>
                        {projectTeamMembers.length > 0 && (
                            <>
                                <optgroup label="Project Team" className="font-bold">
                                    {users.filter(u => projectTeamMembers.includes(u.id)).map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </optgroup>
                            </>
                        )}
                        {users.filter(u => !projectTeamMembers.includes(u.id)).length > 0 && (
                            <optgroup label="Other Resources">
                                {users.filter(u => !projectTeamMembers.includes(u.id)).map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                    </label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date *
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="dependsOn" className="block text-sm font-medium text-gray-700">
                    Depends On (Optional - select tasks this one depends on)
                </label>
                <select
                    id="dependsOn"
                    name="dependsOn"
                    multiple
                    value={formData.dependsOn}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900 min-h-[100px]"
                >
                    {projectTasks.map(task => (
                        <option key={task.id} value={task.id}>
                            {task.title} ({task.status})
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-700 mt-2">Hold Ctrl/Cmd to select multiple tasks</p>
            </div>

            <div className="flex justify-between pt-4">
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Save & Create Another'}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </div>
        </form>
    )
}
