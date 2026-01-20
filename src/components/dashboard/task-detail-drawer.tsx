'use client'

import { X, Calendar, AlertCircle, User, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Task {
    id: string
    title: string
    description?: string
    status: string
    priority: string
    startDate?: Date | string
    dueDate?: Date | string
    estimatedHours?: number
    actualHours?: number
    project?: {
        id: string
        name: string
    }
}

interface TaskDetailDrawerProps {
    task: Task
    isOpen: boolean
}

const statusColors: Record<string, string> = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    DONE: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
}

const priorityColors: Record<string, string> = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-yellow-600',
    HIGH: 'text-orange-600',
    URGENT: 'text-red-600',
}

export default function TaskDetailDrawer({ task, isOpen }: TaskDetailDrawerProps) {
    const router = useRouter()

    if (!isOpen) return null

    const handleClose = () => {
        router.back()
    }

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return 'Not set'
        const d = new Date(date)
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <>
            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-700 hover:text-gray-900 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                    </div>

                    {/* Project */}
                    {task.project && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                            <a
                                href={`/dashboard/projects/${task.project.id}`}
                                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition"
                            >
                                {task.project.name}
                            </a>
                        </div>
                    )}

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                            {task.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <div className="flex items-center">
                            <AlertCircle className={`w-5 h-5 mr-2 ${priorityColors[task.priority] || 'text-gray-500'}`} />
                            <span className={`font-medium ${priorityColors[task.priority] || 'text-gray-500'}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{formatDate(task.startDate)}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{formatDate(task.dueDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hours</label>
                            <div className="text-gray-600">
                                {task.estimatedHours ? `${task.estimatedHours}h` : 'Not set'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Actual Hours</label>
                            <div className="text-gray-600">
                                {task.actualHours ? `${task.actualHours}h` : 'Not set'}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                                {task.description}
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="w-full mt-8 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>
    )
}
