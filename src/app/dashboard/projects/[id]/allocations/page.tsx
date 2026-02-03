import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Calendar, DollarSign, Users2, CheckCircle } from "lucide-react"
import { getProject, getUsers, getProjectTeamMembers, getFormattedAllocations } from "@/lib/data"
import MonthlyAllocationsEditor from "@/components/dashboard/monthly-allocations-editor"
import AddTeamMemberModal from "@/components/dashboard/add-team-member-modal"

export default async function AllocationsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    // Await params to fix Next.js 15+ async issue
    const { id: projectId } = await params

    // Fetch project data
    const project = await getProject(projectId)

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-500">Project not found</p>
                    </div>
                </div>
            </div>
        )
    }

    // Get actual team members from database
    const teamMembers = await getProjectTeamMembers(projectId)

    // Get existing allocations from database
    const existingAllocations = await getFormattedAllocations(projectId)

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <Link
                    href={`/dashboard/projects/${projectId}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Project
                </Link>

                {/* Project Summary Header */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                                <p className="text-gray-600">{project.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {project.status && (
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                                        style={{
                                            backgroundColor: project.status === 'ACTIVE' ? '#dcfce7' :
                                                project.status === 'COMPLETED' ? '#dbeafe' :
                                                    project.status === 'ON_HOLD' ? '#fef3c7' : '#fee2e2',
                                            color: project.status === 'ACTIVE' ? '#15803d' :
                                                project.status === 'COMPLETED' ? '#1e40af' :
                                                    project.status === 'ON_HOLD' ? '#92400e' : '#991b1b'
                                        }}>
                                        {project.status === 'ACTIVE' ? 'Active' :
                                            project.status === 'COMPLETED' ? 'Completed' :
                                                project.status === 'ON_HOLD' ? 'On Hold' : 'Cancelled'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Start Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(project.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">End Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(project.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Budget</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        ${project.budget?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users2 className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Team Members</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {project.teamMembers?.length || 0}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Progress</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {Math.round((project.progress || 0))}% ({project.completedTasks || 0}/{project.totalTasks || 0})
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Team Allocations</h2>
                    <AddTeamMemberModal
                        projectId={projectId}
                        allUsers={await getUsers()}
                        currentTeamMemberIds={teamMembers.map((m: any) => m.userId)}
                    />
                </div>

                {/* Monthly Budget Allocation */}
                <MonthlyAllocationsEditor project={project} teamMembers={teamMembers} initialAllocations={existingAllocations} />

                {/* Task Allocations */}
                <div className="bg-white rounded-lg shadow mt-4">
                    <div className="px-4 py-2 border-b border-gray-200">
                        <h2 className="text-base font-semibold text-gray-900">Tasks</h2>
                    </div>

                    {project.tasks && project.tasks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Task</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Assignee</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {project.tasks.map((task: any) => (
                                        <tr key={task.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <p className="text-xs text-gray-600">{task.assignee?.name || task.assignee?.email || 'Unassigned'}</p>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${task.status === 'DONE' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        'bg-gray-50 text-gray-700 border border-gray-200'
                                                    }`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                <p className="text-xs text-gray-600">{task.priority || 'N/A'}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-4 py-4 text-center">
                            <p className="text-xs text-gray-500">No tasks assigned yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
