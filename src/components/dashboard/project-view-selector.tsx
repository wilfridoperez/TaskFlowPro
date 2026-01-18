'use client'

import { useState } from 'react'
import { List, BarChart3 } from 'lucide-react'
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
    tasks: Task[]
    users: User[]
    projectStartDate?: Date
    projectEndDate?: Date
}

export default function ProjectViewSelector({
    tasks,
    users,
    projectStartDate,
    projectEndDate
}: ProjectViewSelectorProps) {
    const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list')
    const [localTasks, setLocalTasks] = useState(tasks)

    const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
        setLocalTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            )
        )
    }

    return (
        <>
            {/* View Toggle Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${viewMode === 'list'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <List className="w-4 h-4" />
                    List View
                </button>
                <button
                    onClick={() => setViewMode('gantt')}
                    className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${viewMode === 'gantt'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Gantt Chart
                </button>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <TaskListClient tasks={localTasks} users={users} />
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
