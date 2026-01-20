'use client'

import Link from "next/link"
import { MoreVertical, Edit2, Eye, Folder } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const statusIcons = {
    TODO: Eye,
    IN_PROGRESS: Eye,
    IN_REVIEW: Eye,
    DONE: Eye,
    CANCELLED: Eye,
}

const priorityColors = {
    LOW: "text-gray-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
    URGENT: "text-red-700",
}

interface TaskItemProps {
    task: any
}

export default function TaskItem({ task }: TaskItemProps) {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const dueDateStr = task.dueDate 
        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'No due date'

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleViewTask = () => {
        setShowMenu(false)
        // Navigation happens via Link
    }

    const handleEditTask = () => {
        setShowMenu(false)
        // Navigation happens via Link
    }

    const handleViewProject = () => {
        setShowMenu(false)
        // Navigation happens via Link
    }

    return (
        <li className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                            <Link
                                href={`/dashboard/tasks/${task.id}`}
                                className="hover:text-blue-600"
                            >
                                {task.title}
                            </Link>
                        </h4>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                            {task.projectName && task.projectId && (
                                <Link
                                    href={`/dashboard/projects/${task.projectId}`}
                                    className="mr-3 font-medium text-gray-600 hover:text-blue-600 hover:underline"
                                >
                                    {task.projectName}
                                </Link>
                            )}
                            <span className="mr-3">Due {dueDateStr}</span>
                            <span
                                className={`font-medium ${priorityColors[task.priority as keyof typeof priorityColors]
                                    }`}
                            >
                                {task.priority}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === "DONE"
                            ? "bg-green-100 text-green-800"
                            : task.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800"
                                : task.status === "IN_REVIEW"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : task.status === "CANCELLED"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                        }`}>
                        {task.status.replace("_", " ")}
                    </span>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Options"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                {/* View Task */}
                                <Link
                                    href={`/dashboard/tasks/${task.id}`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200 first:rounded-t-lg"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Task
                                </Link>

                                {/* Edit Task */}
                                <Link
                                    href={`/dashboard/tasks/${task.id}?edit=true`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Task
                                </Link>

                                {/* View Project */}
                                {task.projectId && (
                                    <Link
                                        href={`/dashboard/projects/${task.projectId}`}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <Folder className="w-4 h-4" />
                                        View Project
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </li>
    )
}
