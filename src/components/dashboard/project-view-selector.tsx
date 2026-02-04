'use client'

import { useState } from 'react'
import { List, BarChart3, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import TaskListClient from './task-list-client'
import GanttChart from './gantt-chart'

interface Task {
    id: string
    title: string
    description?: string
    status: string
    priority: string
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

interface ProjectViewSelectorProps {
    projectId: string
    tasks: Task[]
    users: User[]
    projectStartDate?: Date
    projectEndDate?: Date
}

export default function ProjectViewSelector({
    projectId,
    tasks,
    users,
    projectStartDate,
    projectEndDate
}: ProjectViewSelectorProps) {
    const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list')
    const [localTasks, setLocalTasks] = useState(tasks)
    const [filterOpen, setFilterOpen] = useState(false)

    const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
        setLocalTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            )
        )
    }

    return (
        <>
            {/* Consolidated Header Row */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-4">
                    <h2 className="text-base font-semibold text-gray-900">Tasks</h2>
                    {/* View Toggle Tabs - Inline */}
                    <div className="flex gap-2 border-l border-gray-200 pl-4">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${viewMode === 'list'
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <List className="w-3.5 h-3.5" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${viewMode === 'gantt'
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Gantt
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Showing {localTasks.length} of {tasks.length}</span>
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-900"
                        title="Toggle filters"
                    >
                        <Filter className="w-4 h-4" />
                        {filterOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <Link
                        href={`/dashboard/tasks/new?projectId=${projectId}`}
                        className="bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Add Task
                    </Link>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <TaskListClient tasks={localTasks} users={users} filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
            ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <GanttChart
                        tasks={localTasks}
                        users={users}
                        projectStartDate={projectStartDate}
                        projectEndDate={projectEndDate}
                        onTaskUpdate={handleTaskUpdate}
                    />
                </div>
            )}
        </>
    )
}
