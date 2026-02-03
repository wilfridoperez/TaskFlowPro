'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, AlertCircle, Link2, Edit2, CheckCircle, Filter, X } from 'lucide-react'
import TaskDetailModal from './task-detail-modal'
import EnhancedTaskTable from './enhanced-task-table'
import { updateTaskById } from '@/lib/actions'

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

type SortField = 'title' | 'priority' | 'startDate' | 'dueDate' | 'status' | 'assignedTo'
type SortOrder = 'asc' | 'desc'

const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
const statusOrder = { TODO: 0, IN_PROGRESS: 1, IN_REVIEW: 2, DONE: 3 }

export default function TaskListClient({ tasks, users }: { tasks: Task[], users: User[] }) {
    const [sortField, setSortField] = useState<SortField>('dueDate')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [filterStatus, setFilterStatus] = useState<string>('ALL')
    const [filterPriority, setFilterPriority] = useState<string>('ALL')
    const [filterAssignee, setFilterAssignee] = useState<string>('ALL')
    const [filterStartDateFrom, setFilterStartDateFrom] = useState<string>('')
    const [filterStartDateTo, setFilterStartDateTo] = useState<string>('')
    const [expandedDeps, setExpandedDeps] = useState<Set<string>>(new Set())
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [updatedTasks, setUpdatedTasks] = useState<{ [key: string]: Partial<Task> }>({})
    const [filterOpen, setFilterOpen] = useState<boolean>(false)

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId)
        return user?.name || 'Unassigned'
    }

    const getTaskById = (id: string) => {
        return tasks.find(t => t.id === id)
    }

    const getDisplayTask = (taskId: string): Task | undefined => {
        const baseTask = getTaskById(taskId)
        const updates = updatedTasks[taskId]
        if (!baseTask) return undefined
        return updates ? { ...baseTask, ...updates } as Task : baseTask
    }

    const handleTaskUpdate = async (updates: Partial<Task>) => {
        if (selectedTask) {
            // Update local state for instant UI feedback
            setUpdatedTasks(prev => ({
                ...prev,
                [selectedTask.id]: { ...prev[selectedTask.id], ...updates }
            }))
            setSelectedTask(prev => prev ? { ...prev, ...updates } : null)

            // Persist to database
            try {
                await updateTaskById(selectedTask.id, updates)
            } catch (error) {
                console.error('Error updating task:', error)
                // Optionally revert changes on error
            }
        }
    }

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        // Update local state for instant UI feedback
        setUpdatedTasks(prev => ({
            ...prev,
            [taskId]: { ...prev[taskId], status: newStatus }
        }))

        // Persist to database
        try {
            await updateTaskById(taskId, { status: newStatus })
        } catch (error) {
            console.error('Error updating task status:', error)
            // Optionally revert changes on error
            setUpdatedTasks(prev => ({
                ...prev,
                [taskId]: { ...prev[taskId], status: undefined }
            }))
        }
    }

    const getDependencyStatus = (task: Task | undefined) => {
        if (!task || !task.dependsOn || task.dependsOn.length === 0) return 'none'
        const allDependenciesComplete = task.dependsOn.every(depId => {
            const depTask = getTaskById(depId)
            return depTask?.status === 'DONE'
        })
        return allDependenciesComplete ? 'ready' : 'blocked'
    }

    const filtered = useMemo(() => {
        return tasks.filter(task => {
            if (filterStatus !== 'ALL' && task.status !== filterStatus) return false
            if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false
            if (filterAssignee !== 'ALL' && task.assignedTo !== filterAssignee) return false
            if (filterStartDateFrom) {
                const fromDate = new Date(filterStartDateFrom).getTime()
                if (!task.startDate || new Date(task.startDate).getTime() < fromDate) return false
            }
            if (filterStartDateTo) {
                const toDate = new Date(filterStartDateTo).getTime()
                if (!task.startDate || new Date(task.startDate).getTime() > toDate) return false
            }
            return true
        })
    }, [tasks, filterStatus, filterPriority, filterAssignee, filterStartDateFrom, filterStartDateTo])

    const sorted = useMemo(() => {
        const copy = [...filtered]
        copy.sort((a, b) => {
            let aVal: any = a[sortField]
            let bVal: any = b[sortField]

            if (sortField === 'priority') {
                aVal = priorityOrder[aVal as keyof typeof priorityOrder] ?? 3
                bVal = priorityOrder[bVal as keyof typeof priorityOrder] ?? 3
            } else if (sortField === 'status') {
                aVal = statusOrder[aVal as keyof typeof statusOrder] ?? 3
                bVal = statusOrder[bVal as keyof typeof statusOrder] ?? 3
            } else if (sortField === 'startDate') {
                aVal = aVal ? new Date(aVal).getTime() : Infinity
                bVal = bVal ? new Date(bVal).getTime() : Infinity
            } else if (sortField === 'dueDate') {
                aVal = aVal ? new Date(aVal).getTime() : Infinity
                bVal = bVal ? new Date(bVal).getTime() : Infinity
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
            return 0
        })
        return copy
    }, [filtered, sortField, sortOrder])

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className="w-4 h-4 text-gray-500"></span>
        return sortOrder === 'asc' ?
            <ChevronUp className="w-4 h-4 text-blue-600" /> :
            <ChevronDown className="w-4 h-4 text-blue-600" />
    }

    return (
        <div>
            {/* Filter Toggle */}
            <div className="mb-6 border border-gray-300 rounded-lg bg-white">
                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Filters</span>
                        {(filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL' || filterStartDateFrom || filterStartDateTo) && (
                            <div className="flex items-center gap-2 ml-4">
                                {filterStatus !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {filterStatus === 'IN_PROGRESS' ? 'In Progress' : filterStatus}
                                    </span>
                                )}
                                {filterPriority !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                        {filterPriority}
                                    </span>
                                )}
                                {filterAssignee !== 'ALL' && (
                                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        {getUserName(filterAssignee)}
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
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200 grid grid-cols-3 gap-4">
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
                                <option value="DONE">Done</option>
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
                                <option value="HIGH">High</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                            <select
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="ALL">All Team Members</option>
                                <option value="">Unassigned</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filterStartDateFrom}
                                    onChange={(e) => setFilterStartDateFrom(e.target.value)}
                                    placeholder="From"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                    type="date"
                                    value={filterStartDateTo}
                                    onChange={(e) => setFilterStartDateTo(e.target.value)}
                                    placeholder="To"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-600 mb-4">
                Showing {sorted.length} of {tasks.length} tasks
            </p>

            {/* Enhanced Task Table */}
            <EnhancedTaskTable
                tasks={sorted.map(task => {
                    const displayTask = getDisplayTask(task.id)
                    return displayTask || task
                })}
                users={users}
                sortField={sortField}
                sortOrder={sortOrder}
                onToggleSort={toggleSort}
                onStatusChange={handleStatusChange}
                onEditTask={setSelectedTask}
            />

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    allTasks={tasks}
                    users={users}
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleTaskUpdate}
                />
            )}
        </div>
    )
}
