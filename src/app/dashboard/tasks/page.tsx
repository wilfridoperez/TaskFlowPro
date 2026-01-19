import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Plus, CheckCircle, Clock, AlertCircle, Calendar, Flag } from "lucide-react"
import Link from "next/link"
import { getAllTasks } from "@/lib/data"

const mockTasks = [
    {
        id: "1",
        title: "Update homepage design",
        description: "Redesign the homepage layout with modern UI components and improved user experience",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2025-01-05",
        project: "Website Redesign",
        projectId: "1",
        assignee: "John Doe"
    },
    {
        id: "2",
        title: "Review API documentation",
        description: "Complete review of REST API documentation for mobile app integration",
        status: "TO DO",
        priority: "MEDIUM",
        dueDate: "2025-01-08",
        project: "Mobile App",
        projectId: "2",
        assignee: "Jane Smith"
    },
    {
        id: "3",
        title: "Test payment integration",
        description: "End-to-end testing of Stripe payment processing and error handling",
        status: "IN_REVIEW",
        priority: "HIGH",
        dueDate: "2025-01-03",
        project: "Mobile App",
        projectId: "2",
        assignee: "Mike Johnson"
    },
    {
        id: "4",
        title: "Create social media assets",
        description: "Design banner images and promotional content for social media campaigns",
        status: "COMPLETED",
        priority: "LOW",
        dueDate: "2025-01-02",
        project: "Marketing Campaign",
        projectId: "3",
        assignee: "Sarah Wilson"
    },
    {
        id: "5",
        title: "Database optimization",
        description: "Optimize database queries and add proper indexing for better performance",
        status: "TO DO",
        priority: "MEDIUM",
        dueDate: "2025-01-10",
        project: "Website Redesign",
        projectId: "1",
        assignee: "David Brown"
    },
    {
        id: "6",
        title: "User authentication flow",
        description: "Implement secure user authentication with JWT tokens and session management",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2025-01-07",
        project: "Mobile App",
        projectId: "2",
        assignee: "Emily Davis"
    }
]

const statusIcons = {
    TODO: Clock,
    IN_PROGRESS: Clock,
    IN_REVIEW: AlertCircle,
    COMPLETED: CheckCircle,
}

const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
}

const priorityColors = {
    LOW: "text-gray-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
    URGENT: "text-red-700",
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
                            {mockTasks.map((task) => {
                                const StatusIcon = statusIcons[task.status as keyof typeof statusIcons]
                                return (
                                    <li key={task.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start space-x-3">
                                                <StatusIcon className="flex-shrink-0 mt-1 h-5 w-5 text-gray-400" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        <Link
                                                            href={`/dashboard/tasks/${task.id}`}
                                                            className="hover:text-blue-600 transition-colors"
                                                        >
                                                            {task.title}
                                                        </Link>
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {task.description}
                                                    </p>
                                                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                                                        <Link
                                                            href={`/dashboard/projects/${task.projectId}`}
                                                            className="hover:text-blue-600 transition-colors"
                                                        >
                                                            {task.project}
                                                        </Link>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            Due {new Date(task.dueDate).toLocaleDateString()}
                                                        </div>
                                                        <span>Assigned to {task.assignee}</span>
                                                        <div className="flex items-center">
                                                            <Flag className={`w-3 h-3 mr-1 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
                                                            <span className={`font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
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
                                )
                            })}
                        </ul>
                        {tasks.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No tasks found. {status && <Link href="/dashboard/tasks" className="text-blue-600 hover:text-blue-800">View all tasks</Link>}</p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}