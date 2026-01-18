import Link from "next/link"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

const mockTasks = [
    {
        id: "1",
        title: "Update homepage design",
        status: "IN_PROGRESS",
        priority: "HIGH",
        dueDate: "2025-01-05",
        project: "Website Redesign",
    },
    {
        id: "2",
        title: "Review API documentation",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "2025-01-08",
        project: "Mobile App",
    },
    {
        id: "3",
        title: "Test payment integration",
        status: "IN_REVIEW",
        priority: "HIGH",
        dueDate: "2025-01-03",
        project: "Mobile App",
    },
    {
        id: "4",
        title: "Create social media assets",
        status: "DONE",
        priority: "LOW",
        dueDate: "2025-01-02",
        project: "Marketing Campaign",
    },
]

const statusIcons = {
    TODO: Clock,
    IN_PROGRESS: Clock,
    IN_REVIEW: AlertCircle,
    DONE: CheckCircle,
}

const priorityColors = {
    LOW: "text-gray-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
    URGENT: "text-red-700",
}

export function RecentTasks() {
    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Tasks
                </h3>
                <Link
                    href="/dashboard/tasks"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View all
                </Link>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {mockTasks.map((task) => {
                        const StatusIcon = statusIcons[task.status as keyof typeof statusIcons]
                        return (
                            <li key={task.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <StatusIcon className="flex-shrink-0 mr-3 h-5 w-5 text-gray-400" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">
                                                <Link
                                                    href={`/dashboard/tasks/${task.id}`}
                                                    className="hover:text-blue-600"
                                                >
                                                    {task.title}
                                                </Link>
                                            </h4>
                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                <span className="mr-3">{task.project}</span>
                                                <span className="mr-3">Due {task.dueDate}</span>
                                                <span
                                                    className={`font-medium ${priorityColors[task.priority as keyof typeof priorityColors]
                                                        }`}
                                                >
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === "DONE"
                                            ? "bg-green-100 text-green-800"
                                            : task.status === "IN_PROGRESS"
                                                ? "bg-blue-100 text-blue-800"
                                                : task.status === "IN_REVIEW"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {task.status.replace("_", " ")}
                                    </span>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}