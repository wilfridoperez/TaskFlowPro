import Link from "next/link"
import { getAllTasks } from "@/lib/data"
import TaskItem from "./task-item"

const priorityColors = {
    LOW: "text-gray-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
    URGENT: "text-red-700",
}

export async function RecentTasks() {
    const allTasks = await getAllTasks()
    const tasks = allTasks.slice(0, 5) // Show 5 most recent tasks

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
                    {tasks.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6">
                            <p className="text-gray-500">No tasks yet. <Link href="/dashboard/tasks/new" className="text-blue-600 hover:text-blue-700">Create one</Link></p>
                        </li>
                    ) : (
                        tasks.map((task) => (
                            <TaskItem key={task.id} task={task} />
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}