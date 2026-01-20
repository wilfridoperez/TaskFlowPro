import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllTasks, getTask } from "@/lib/data"
import TaskDetailDrawer from "@/components/dashboard/task-detail-drawer"
import TasksListClient from "@/components/dashboard/tasks-list-client"

const statusColors = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    IN_REVIEW: "bg-yellow-100 text-yellow-800",
    DONE: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
}

const priorityColors = {
    LOW: "text-gray-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
    URGENT: "text-red-700",
}

export default async function TaskDetailPage({ 
    params,
    searchParams
}: { 
    params: Promise<{ id: string }>
    searchParams: Promise<{ status?: string }>
}) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const { id: taskId } = await params
    const status = (await searchParams).status

    // Fetch the task
    const task = await getTask(taskId)

    if (!task) {
        redirect("/dashboard/tasks")
    }

    // Fetch all tasks for the background list
    const allTasks = await getAllTasks(session.user.id, status)

    return (
        <>
            {/* Tasks list in background */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <Link href="/dashboard/tasks/new" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        New Task
                    </Link>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/tasks"
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${!status ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                        All
                    </Link>
                    {Object.keys(statusColors).map((s) => (
                        <Link
                            key={s}
                            href={`/dashboard/tasks?status=${s}`}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${status === s ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                            {s}
                        </Link>
                    ))}
                </div>

                <TasksListClient tasks={allTasks} statusColors={statusColors} priorityColors={priorityColors} />
            </div>

            {/* Drawer overlay */}
            <TaskDetailDrawer task={task} isOpen={true} />
        </>
    )
}