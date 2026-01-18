import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createTask } from "@/lib/actions"
import { getUsers, getTasksInProject, getProject } from "@/lib/data"

async function createTaskAction(formData: FormData) {
    "use server"

    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const projectId = formData.get("projectId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string || ""
    const priority = formData.get("priority") as string || "MEDIUM"
    const startDate = formData.get("startDate") as string || ""
    const dueDate = formData.get("dueDate") as string || ""
    const assignedTo = formData.get("assignedTo") as string || null
    const dependsOnStr = formData.get("dependsOn") as string || ""
    const dependsOn = dependsOnStr ? dependsOnStr.split(",").filter(id => id.trim()) : []

    if (!title) {
        throw new Error("Task title is required")
    }

    // Create task using persistent data storage
    const newTask = await createTask({
        title,
        description,
        priority,
        startDate,
        dueDate,
        projectId,
        assignedTo,
        dependsOn
    })

    console.log("Created task:", newTask)

    // Redirect back to the project page
    redirect(`/dashboard/projects/${projectId}`)
}

export default async function NewTaskPage({
    searchParams
}: {
    searchParams: Promise<{ projectId?: string }>
}) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const { projectId } = await searchParams

    if (!projectId) {
        redirect("/dashboard")
    }

    const users = await getUsers()
    const projectTasks = await getTasksInProject(projectId)
    const project = await getProject(projectId)
    const projectTeamMembers = project?.teamMembers || []

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center">
                    <Link
                        href={`/dashboard/projects/${projectId}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Project
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Task</h1>

                    <form action={createTaskAction} className="space-y-6">
                        <input type="hidden" name="projectId" value={projectId} />

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900 placeholder-gray-400"
                                placeholder="Enter task title"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900 placeholder-gray-400"
                                placeholder="Enter task description"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                                    Assign To
                                </label>
                                <select
                                    id="assignedTo"
                                    name="assignedTo"
                                    defaultValue=""
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                                >
                                    <option value="">Unassigned</option>
                                    {projectTeamMembers.length > 0 && (
                                        <>
                                            <optgroup label="Project Team" className="font-bold">
                                                {users.filter(u => projectTeamMembers.includes(u.id)).map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.name} ({user.email})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </>
                                    )}
                                    {users.filter(u => !projectTeamMembers.includes(u.id)).length > 0 && (
                                        <optgroup label="Other Resources">
                                            {users.filter(u => !projectTeamMembers.includes(u.id)).map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM" selected>Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                                />
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    required
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dependsOn" className="block text-sm font-medium text-gray-700">
                                Depends On (Optional - select tasks this one depends on)
                            </label>
                            <select
                                id="dependsOn"
                                name="dependsOn"
                                multiple
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border text-gray-900 min-h-[100px]"
                            >
                                {projectTasks.map(task => (
                                    <option key={task.id} value={task.id}>
                                        {task.title} ({task.status})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-700 mt-2">Hold Ctrl/Cmd to select multiple tasks</p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Link
                                href={`/dashboard/projects/${projectId}`}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}