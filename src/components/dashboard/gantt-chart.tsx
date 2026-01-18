'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'

interface Task {
    id: string
    title: string
    status: string
    priority: string
    dueDate?: Date | string
    startDate?: Date | string
    assignedTo?: string
    dependsOn?: string[]
    duration?: number // duration in days
}

interface User {
    id: string
    name: string
}

interface GanttChartProps {
    tasks: Task[]
    users: User[]
    projectStartDate?: Date
    projectEndDate?: Date
    onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
}

export default function GanttChart({ tasks, users, projectStartDate, projectEndDate, onTaskUpdate }: GanttChartProps) {
    const [expandedDeps, setExpandedDeps] = useState<Set<string>>(new Set())
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [viewType, setViewType] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')

    if (!tasks || tasks.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No tasks to display in Gantt chart</p>
            </div>
        )
    }

    // Get date range for the chart
    const taskDates = tasks
        .filter(t => t.dueDate)
        .map(t => new Date(t.dueDate!).getTime())

    const startDate = projectStartDate
        ? new Date(projectStartDate)
        : taskDates.length > 0
            ? new Date(Math.min(...taskDates))
            : new Date()

    const endDate = projectEndDate
        ? new Date(projectEndDate)
        : taskDates.length > 0
            ? new Date(Math.max(...taskDates))
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    // Generate timeline headers based on view type
    const generateTimelineHeaders = () => {
        const headers: { date: Date; label: string; width: number }[] = []

        if (viewType === 'weekly') {
            const weekCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
            for (let i = 0; i < Math.min(weekCount, 13); i++) {
                const weekStart = new Date(startDate)
                weekStart.setDate(weekStart.getDate() + i * 7)
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekEnd.getDate() + 6)
                headers.push({
                    date: weekStart,
                    label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                    width: (7 * 24 * 60 * 60 * 1000) / (endDate.getTime() - startDate.getTime()) * 100
                })
            }
        } else if (viewType === 'monthly') {
            let current = new Date(startDate)
            current.setDate(1)
            while (current < endDate) {
                const monthStart = new Date(current)
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
                const monthDuration = monthEnd.getTime() - monthStart.getTime()
                headers.push({
                    date: monthStart,
                    label: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    width: monthDuration / (endDate.getTime() - startDate.getTime()) * 100
                })
                current.setMonth(current.getMonth() + 1)
            }
        } else if (viewType === 'yearly') {
            let current = new Date(startDate.getFullYear(), 0, 1)
            while (current < endDate) {
                const yearStart = new Date(current)
                const yearEnd = new Date(current.getFullYear() + 1, 0, 0)
                const yearDuration = yearEnd.getTime() - yearStart.getTime()
                headers.push({
                    date: yearStart,
                    label: yearStart.getFullYear().toString(),
                    width: yearDuration / (endDate.getTime() - startDate.getTime()) * 100
                })
                current.setFullYear(current.getFullYear() + 1)
            }
        }

        return headers
    }

    const timelineHeaders = useMemo(() => generateTimelineHeaders(), [viewType, startDate.getTime(), endDate.getTime()])

    // Generate week headers for timeline
    const weekCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const weeks = Array.from({ length: Math.min(weekCount, 13) }, (_, i) => {
        const weekStart = new Date(startDate)
        weekStart.setDate(weekStart.getDate() + i * 7)
        return weekStart
    })

    // Memoize task position calculation based on date range and view type
    const getTaskPosition = useMemo(() => {
        return (task: Task) => {
            if (!task.startDate && !task.dueDate) return { left: 0, width: 0 }

            const taskStartTime = task.startDate ? new Date(task.startDate).getTime() : new Date(task.dueDate!).getTime() - (7 * 24 * 60 * 60 * 1000)
            const taskEndTime = task.dueDate ? new Date(task.dueDate).getTime() : taskStartTime + (7 * 24 * 60 * 60 * 1000)

            const rangeMs = endDate.getTime() - startDate.getTime()
            const startOffsetMs = taskStartTime - startDate.getTime()
            const left = (startOffsetMs / rangeMs) * 100
            const duration = taskEndTime - taskStartTime
            const width = (duration / rangeMs) * 100

            // Ensure minimum width of 2% for visibility
            const minWidth = 2

            return {
                left: left,
                width: Math.max(minWidth, width)
            }
        }
    }, [startDate.getTime(), endDate.getTime()])

    const getTaskDuration = (task: Task) => {
        if (!task.startDate || !task.dueDate) return 0
        const start = new Date(task.startDate).getTime()
        const end = new Date(task.dueDate).getTime()
        return Math.ceil((end - start) / (24 * 60 * 60 * 1000))
    }


    // Dragging disabled - revisit later

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500'
            case 'IN_PROGRESS':
                return 'bg-blue-500'
            default:
                return 'bg-gray-400'
        }
    }

    const getUserName = (userId?: string) => {
        if (!userId) return 'Unassigned'
        return users.find(u => u.id === userId)?.name || 'Unknown'
    }

    const toggleDependencies = (taskId: string) => {
        setExpandedDeps(prev => {
            const newSet = new Set(prev)
            if (newSet.has(taskId)) {
                newSet.delete(taskId)
            } else {
                newSet.add(taskId)
            }
            return newSet
        })
    }

    return (
        <>
            {/* View Type Toggle */}
            <div className="mb-4 flex gap-2">
                <button
                    onClick={() => setViewType('weekly')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Weekly
                </button>
                {/* Monthly and Yearly hidden for future use */}
                {/* <button
                    onClick={() => setViewType('monthly')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setViewType('yearly')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewType === 'yearly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Yearly
                </button> */}
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full relative">
                    {/* SVG for dependency lines */}
                    <svg
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                        style={{ minHeight: `${tasks.length * 60 + 100}px` }}
                    >
                        {/* Render dependency connector lines */}
                        {tasks.map(task => {
                            if (!task.dependsOn || task.dependsOn.length === 0) return null

                            const taskIndex = tasks.findIndex(t => t.id === task.id)
                            const taskY = 70 + (taskIndex * 60) + 28 // Center of task bar

                            return task.dependsOn.map(depId => {
                                const depTask = tasks.find(t => t.id === depId)
                                if (!depTask) return null

                                const depIndex = tasks.findIndex(t => t.id === depId)
                                const depY = 70 + (depIndex * 60) + 28 // Center of dependent task bar

                                // Get right edge of dependent task (approximately at 80% of timeline + 256px for task name column)
                                const depEndPercent = getTaskPosition(depTask).left + getTaskPosition(depTask).width
                                const depEndX = 256 + (window.innerWidth * depEndPercent / 100)

                                // Get left edge of current task
                                const taskStartPercent = getTaskPosition(task).left
                                const taskStartX = 256 + (window.innerWidth * taskStartPercent / 100)

                                const midX = (depEndX + taskStartX) / 2

                                return (
                                    <g key={`${depId}-${task.id}`}>
                                        {/* Line from dependent task end to current task start */}
                                        <path
                                            d={`M ${depEndX} ${depY} Q ${midX} ${(depY + taskY) / 2} ${taskStartX} ${taskY}`}
                                            stroke="#94a3b8"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeDasharray="4"
                                            opacity="0.6"
                                        />
                                        {/* Arrow head */}
                                        <polygon
                                            points={`${taskStartX},${taskY} ${taskStartX - 6},${taskY - 4} ${taskStartX - 6},${taskY + 4}`}
                                            fill="#94a3b8"
                                            opacity="0.6"
                                        />
                                    </g>
                                )
                            })
                        })}
                    </svg>

                    <div className="min-w-full relative z-10">
                        {/* Timeline Header */}
                        <div className="flex">
                            <div className="w-64 bg-gray-50 border-r border-gray-200 p-3">
                                <p className="text-sm font-semibold text-gray-900">Task</p>
                            </div>
                            <div className="flex-1 bg-gray-50 border-b border-gray-200">
                                <div className="flex h-12">
                                    {timelineHeaders.map((header, i) => (
                                        <div
                                            key={i}
                                            className="border-r border-gray-200 p-2 text-xs font-medium text-gray-600 text-center flex items-center justify-center"
                                            style={{ width: `${header.width}%`, minWidth: '60px' }}
                                        >
                                            {header.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tasks */}
                        {tasks.map(task => (
                            <div key={task.id}>
                                <div className="flex border-b border-gray-100 hover:bg-blue-50 transition-colors">
                                    {/* Task Info */}
                                    <div className="w-64 bg-white p-3 border-r border-gray-200">
                                        <div className="flex items-start gap-2">
                                            {task.dependsOn && task.dependsOn.length > 0 && (
                                                <button
                                                    onClick={() => toggleDependencies(task.id)}
                                                    className="text-gray-400 hover:text-gray-600 mt-0.5"
                                                >
                                                    {expandedDeps.has(task.id) ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            )}
                                            <div className="flex-1 cursor-pointer" onClick={() => setEditingTask(task)}>
                                                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                                <p className="text-xs text-gray-600 mt-1">{getUserName(task.assignedTo)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Bar */}
                                    <div className="flex-1 relative bg-white">
                                        <div className="absolute top-0 left-0 right-0 bottom-0 flex h-14">
                                            {timelineHeaders.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="border-r border-gray-100"
                                                    style={{ width: `${timelineHeaders[i]?.width || 0}%` }}
                                                />
                                            ))}
                                        </div>

                                        {/* Task Bar */}
                                        {(task.startDate || task.dueDate) && (
                                            <div className="absolute top-0 left-0 right-0 h-14 flex items-center p-1 group">
                                                <div
                                                    className={`${getStatusColor(task.status)} rounded h-8 flex items-center px-2 text-xs text-white font-medium shadow-sm hover:shadow-md transition-shadow relative`}
                                                    style={{
                                                        left: `${getTaskPosition(task).left}%`,
                                                        width: `${getTaskPosition(task).width}%`,
                                                        minWidth: '60px',
                                                    }}
                                                    onDoubleClick={() => setEditingTask(task)}
                                                    title={`${task.title} - Double-click to edit`}
                                                >
                                                    {/* Task Content */}
                                                    <span className="truncate text-xs flex-1">
                                                        {task.startDate && task.dueDate && (
                                                            <>
                                                                {new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -
                                                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </>
                                                        )}
                                                        {!task.startDate && task.dueDate && (
                                                            <>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dependencies Expanded */}
                                {expandedDeps.has(task.id) && task.dependsOn && task.dependsOn.length > 0 && (
                                    <div className="bg-gray-50">
                                        {task.dependsOn.map(depId => {
                                            const depTask = tasks.find(t => t.id === depId)
                                            if (!depTask) return null
                                            return (
                                                <div key={depId} className="flex border-b border-gray-100">
                                                    <div className="w-64 bg-gray-50 p-3 border-r border-gray-200 ml-6">
                                                        <p className="text-xs text-gray-600 font-medium">Depends on:</p>
                                                        <p className="text-xs text-gray-700 truncate">{depTask.title}</p>
                                                    </div>
                                                    <div className="flex-1 bg-gray-50 relative">
                                                        <div className="absolute top-0 left-0 right-0 bottom-0 flex h-12">
                                                            {timelineHeaders.map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="border-r border-gray-100"
                                                                    style={{ width: `${timelineHeaders[i]?.width || 0}%` }}
                                                                />
                                                            ))}
                                                        </div>

                                                        {depTask.dueDate && (
                                                            <div className="absolute top-0 left-0 right-0 h-12 flex items-center p-1">
                                                                <div
                                                                    className={`${getStatusColor(depTask.status)} rounded h-6 flex items-center px-2 text-xs text-white opacity-75`}
                                                                    style={{
                                                                        left: `${getTaskPosition(depTask).left}%`,
                                                                        width: `${getTaskPosition(depTask).width}%`,
                                                                        minWidth: '50px',
                                                                    }}
                                                                    title={`${depTask.title} - ${new Date(depTask.dueDate).toLocaleDateString()}`}
                                                                >
                                                                    <span className="truncate text-xs">
                                                                        {new Date(depTask.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-xs text-gray-600">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-xs text-gray-600">In Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                                <span className="text-xs text-gray-600">To Do</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-4 p-4 bg-blue-50 rounded">
                            💡 Tip: <strong>Double-click</strong> task to edit dates
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Task Dates</h2>
                            <button
                                onClick={() => setEditingTask(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Task Title
                                </label>
                                <p className="text-sm text-gray-900">{editingTask.title}</p>
                            </div>

                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={editingTask.startDate ? new Date(editingTask.startDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        startDate: e.target.value ? new Date(e.target.value) : undefined
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditingTask({
                                        ...editingTask,
                                        dueDate: e.target.value ? new Date(e.target.value) : undefined
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-xs font-medium text-gray-700 mb-2">Duration</p>
                                {editingTask.startDate && editingTask.dueDate ? (
                                    <p className="text-sm text-gray-600">
                                        {getTaskDuration({ ...editingTask, startDate: editingTask.startDate, dueDate: editingTask.dueDate })} days
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">Set both start and end dates to calculate duration</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 rounded-b-lg">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (editingTask && onTaskUpdate) {
                                        const updates: Partial<Task> = {}
                                        if (editingTask.startDate) updates.startDate = editingTask.startDate
                                        if (editingTask.dueDate) updates.dueDate = editingTask.dueDate
                                        onTaskUpdate(editingTask.id, updates)
                                    }
                                    setEditingTask(null)
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
