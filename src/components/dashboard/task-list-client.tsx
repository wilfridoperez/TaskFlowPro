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

export default function TaskListClient({ tasks, users, filterOpen, setFilterOpen }: { tasks: Task[], users: User[], filterOpen: boolean, setFilterOpen: (open: boolean) => void }) {
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

    const hasActiveFilters = filterStatus !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL' || filterStartDateFrom || filterStartDateTo

    const clearAllFilters = () => {
        setFilterStatus('ALL')
        setFilterPriority('ALL')
        setFilterAssignee('ALL')
        setFilterStartDateFrom('')
        setFilterStartDateTo('')
    }

    return (
        <div>
            {/* Filter Section - Controlled by parent */}
            <div className="mb-4 border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-300">
                {/* Filter Controls - Expanded Mode */}
                {filterOpen && (
                    <div className="px-3 pb-3 pt-2 bg-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="TODO">To Do</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                                >
                                    <option value="ALL">All Priorities</option>
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                                <select
                                    value={filterAssignee}
                                    onChange={(e) => setFilterAssignee(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                                >
                                    <option value="ALL">All Team Members</option>
                                    <option value="">Unassigned</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filterStartDateFrom}
                                    onChange={(e) => setFilterStartDateFrom(e.target.value)}
                                    placeholder="From"
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                                />
                                <input
                                    type="date"
                                    value={filterStartDateTo}
                                    onChange={(e) => setFilterStartDateTo(e.target.value)}
                                    placeholder="To"
                                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                                />
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="flex justify-end">
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

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
