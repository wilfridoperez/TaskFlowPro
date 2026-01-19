'use client'

import { useState, useMemo } from 'react'
import { Filter, ChevronUp, ChevronDown } from 'lucide-react'
import TaskDetailModal from './task-detail-modal'
import { updateTaskById } from '@/lib/actions'

interface Task {
    id: string
    title: string
    description?: string
    status: string
    priority: string
    dueDate?: Date | string
    startDate?: Date | string
    assignedTo?: string
    assigneeId?: string
    estimatedHours?: number
    actualHours?: number
}

interface TasksListClientProps {
    tasks: Task[]
    statusColors: Record<string, string>
    priorityColors: Record<string, string>
}

export default function TasksListClient({ 
    tasks, 
    statusColors, 
    priorityColors 
}: TasksListClientProps) {
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>('ALL')
    const [filterPriority, setFilterPriority] = useState<string>('ALL')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (filterStatus !== 'ALL' && task.status !== filterStatus) return false
            if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false
            return true
        })
    }, [tasks, filterStatus, filterPriority])

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toLowerCase()
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="border border-gray-300 rounded-lg bg-white">
                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Filters</span>
                        {(filterStatus !== 'ALL' || filterPriority !== 'ALL') && (
                            <div className="flex items-center gap-2 ml-4">
                                {filterStatus !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {getStatusLabel(filterStatus)}
                                    </span>
                                )}
                                {filterPriority !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                        {filterPriority}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {filterOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {/* Filter Dropdowns */}
                {filterOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="IN_REVIEW">In Review</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="ALL">All Priorities</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Table View */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No tasks found</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Task
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Due Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTasks.map((task) => (
                                <tr 
                                    key={task.id} 
                                    onClick={() => {
                                        setSelectedTask(task)
                                        setIsModalOpen(true)
                                    }}
                                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                            {task.description && (
                                                <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {task.dueDate 
                                            ? new Date(task.dueDate).toLocaleDateString()
                                            : 'No date'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    allTasks={tasks}
                    users={[]}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedTask(null)
                    }}
                    onSave={async (updates) => {
                        try {
                            await updateTaskById(selectedTask.id, updates)
                        } catch (error) {
                            console.error('Error saving task:', error)
                        }
                    }}
                />
            )}
        </div>
    )
}
