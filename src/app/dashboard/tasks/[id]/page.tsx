import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllTasks, getTask } from "@/lib/data"
import TaskDetailDrawer from "@/components/dashboard/task-detail-drawer"

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const { id: taskId } = await params

    // Fetch the task
    const task = await getTask(taskId)

    if (!task) {
        redirect("/dashboard/tasks")
    }

    return (
        <>
            <TaskDetailDrawer task={task} isOpen={true} />
        </>
    )
}