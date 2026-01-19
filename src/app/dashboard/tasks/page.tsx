import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { getAllTasks } from "@/lib/data"
import TasksListClient from "@/components/dashboard/tasks-list-client"

const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-800",
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
                        <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
                    </div>
                    <Link
                        href="/dashboard/tasks/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Task
                    </Link>
                </div>

                {/* Tasks List Client Component */}
                <TasksListClient 
                    tasks={allTasks} 
                    statusColors={statusColors}
                    priorityColors={priorityColors}
                />
            </div>
        </div>
    )
}