import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { getAllTasks } from "@/lib/data"

const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
}

export default async function TasksPage({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const { status } = await searchParams
    
    // Fetch real tasks from database
    const allTasks = await getAllTasks()
    
    // Filter tasks by status if provided
    const tasks = status
        ? allTasks.filter(task => task.status === status)
        : allTasks
    
    const pageTitle = status 
        ? `${status.replace('_', ' ').toLowerCase()} Tasks`
        : "All Tasks"

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
                    </div>
                    <Link
                        href="/dashboard/tasks/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Task
                    </Link>
                </div>

                {/* Tasks List */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Task Overview
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and track all your project tasks in one place.
                        </p>
                    </div>

                    <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                            {tasks.map((task) => (
                                <li key={task.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    <span className="hover:text-blue-600 transition-colors">
                                                        {task.title}
                                                    </span>
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                                                    <span>Status: {task.status.replace('_', ' ')}</span>
                                                    <span>Priority: {task.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                                                {task.status.replace('_', ' ').toLowerCase()}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {tasks.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No tasks found. {status && <Link href="/dashboard/tasks" className="text-blue-600 hover:text-blue-800">View all tasks</Link>}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}