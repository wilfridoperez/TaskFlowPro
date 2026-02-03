'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, Link2, Edit2 } from 'lucide-react'

type SortField = 'title' | 'priority' | 'startDate' | 'dueDate' | 'status' | 'assignedTo'

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
    subtasks?: Task[]
}

interface User {
    id: string
    name: string
    email: string
    avatar: string
}

interface EnhancedTaskTableProps {
    tasks: Task[]
    users: User[]
    sortField: SortField
    sortOrder: 'asc' | 'desc'
    onToggleSort: (field: SortField) => void
    onStatusChange: (taskId: string, newStatus: string) => Promise<void>
    onEditTask: (task: Task) => void
}

const statusConfig: { [key: string]: { label: string; bg: string; text: string } } = {
    TODO: { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-800' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-800' },
    IN_REVIEW: { label: 'In Review', bg: 'bg-purple-100', text: 'text-purple-800' },
    DONE: { label: 'Done', bg: 'bg-green-100', text: 'text-green-800' },
    STUCK: { label: 'Stuck', bg: 'bg-red-100', text: 'text-red-800' },
}

const priorityConfig: { [key: string]: { label: string; bg: string; text: string } } = {
    HIGH: { label: 'High', bg: 'bg-red-100', text: 'text-red-800' },
    MEDIUM: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-800' },
    LOW: { label: 'Low', bg: 'bg-blue-100', text: 'text-blue-800' },
}

const SortIcon = ({ isActive, order }: { isActive: boolean; order: 'asc' | 'desc' }) => {
    if (!isActive) return <span className="w-4 h-4" />
    return order === 'asc' ? (
        <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
        <ChevronDown className="w-4 h-4 text-blue-600" />
    )
}

export default function EnhancedTaskTable({
    tasks,
    users,
    sortField,
    sortOrder,
    onToggleSort,
    onStatusChange,
    onEditTask,
}: EnhancedTaskTableProps) {
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
    const [isChangingStatus, setIsChangingStatus] = useState<string | null>(null)

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev => {
            const next = new Set(prev)
            if (next.has(taskId)) {
                next.delete(taskId)
            } else {
                next.add(taskId)
            }
            return next
        })
    }

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId)
        return user?.name || 'Unassigned'
    }

    const getUserAvatar = (userId: string) => {
        const user = users.find(u => u.id === userId)
        return user?.avatar || '?'
    }

    const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.TODO
    const getPriorityConfig = (priority: string) => priorityConfig[priority] || priorityConfig.LOW

    const formatDate = (date?: Date | string) => {
        if (!date) return '—'
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        setIsChangingStatus(taskId)
        try {
            await onStatusChange(taskId, newStatus)
        } finally {
            setIsChangingStatus(null)
        }
    }

    return (
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Header */}
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => onToggleSort('title')}
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                                >
                                    Task
                                    <SortIcon isActive={sortField === 'title'} order={sortOrder} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => onToggleSort('assignedTo')}
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                                >
                                    Owner
                                    <SortIcon isActive={sortField === 'assignedTo'} order={sortOrder} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => onToggleSort('status')}
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                                >
                                    Status
                                    <SortIcon isActive={sortField === 'status'} order={sortOrder} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => onToggleSort('dueDate')}
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                                >
                                    Due Date
                                    <SortIcon isActive={sortField === 'dueDate'} order={sortOrder} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <button
                                    onClick={() => onToggleSort('priority')}
                                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                                >
                                    Priority
                                    <SortIcon isActive={sortField === 'priority'} order={sortOrder} />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Budget
                                </span>
                            </th>
                            <th className="px-4 py-3 text-left">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </span>
                            </th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="divide-y divide-gray-100">
                        {tasks.map((task) => {
                            const isExpanded = expandedTasks.has(task.id)
                            const hasSubtasks = task.subtasks && task.subtasks.length > 0
                            const statusConfig = getStatusConfig(task.status)
                            const priorityConfig = getPriorityConfig(task.priority)

                            return (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-start gap-3">
                                            {hasSubtasks && (
                                                <button
                                                    onClick={() => toggleExpand(task.id)}
                                                    className="mt-0.5 p-0.5 hover:bg-gray-200 rounded transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                                    ) : (
                                                        <ChevronUp className="w-4 h-4 text-gray-600" />
                                                    )}
                                                </button>
                                            )}
                                            {!hasSubtasks && <div className="w-5" />}
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                                                {task.description && (
                                                    <p className="text-xs text-gray-600 mt-0.5">{task.description}</p>
                                                )}
                                                {task.dependsOn && task.dependsOn.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                                        <Link2 className="w-3 h-3" />
                                                        <span>{task.dependsOn.length} dependencies</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-medium text-white">
                                                {getUserAvatar(task.assignedTo)}
                                            </div>
                                            <span className="text-sm text-gray-700">{getUserName(task.assignedTo)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                            disabled={isChangingStatus === task.id}
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-colors ${statusConfig.bg} ${statusConfig.text} hover:opacity-80 disabled:opacity-50`}
                                        >
                                            <option value="TODO">To Do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="IN_REVIEW">In Review</option>
                                            <option value="DONE">Done</option>
                                            <option value="STUCK">Stuck</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-700 font-medium">
                                            {formatDate(task.dueDate)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                                            {priorityConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-700">
                                            {task.startDate ? `$${Math.random() * 1000 | 0}` : '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => onEditTask(task)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty state */}
            {tasks.length === 0 && (
                <div className="text-center py-8">
                    <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">No tasks yet</p>
                    <p className="text-xs text-gray-500 mt-1">Create your first task to get started</p>
                </div>
            )}
        </div>
    )
}
