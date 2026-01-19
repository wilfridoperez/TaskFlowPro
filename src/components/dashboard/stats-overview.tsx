import { BarChart3, CheckCircle, Clock, Users } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma-client"

export async function StatsOverview() {
    // Fetch real data from database
    const totalProjects = await prisma.project.count()
    const allTasks = await prisma.task.findMany({
        select: { status: true }
    })

    const activeTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length
    const totalTeamMembers = await prisma.user.count()

    // Calculate previous period values for comparison (mock data for now)
    // In a real app, you'd query historical data
    const prevTotalProjects = Math.max(1, Math.floor(totalProjects * 0.977)) // 12 if current is 12
    const prevActiveTasks = Math.max(1, Math.floor(activeTasks * 0.893)) // 43 if current is 48
    const prevCompletedTasks = Math.max(1, Math.floor(completedTasks * 0.925)) // 144 if current is 156
    const prevTeamMembers = Math.max(1, Math.floor(totalTeamMembers * 0.875)) // 7 if current is 8

    // Calculate percentage changes
    const projectsChange = ((totalProjects - prevTotalProjects) / prevTotalProjects * 100).toFixed(1)
    const tasksChange = ((activeTasks - prevActiveTasks) / prevActiveTasks * 100).toFixed(1)
    const completedChange = ((completedTasks - prevCompletedTasks) / prevCompletedTasks * 100).toFixed(1)
    const membersChange = totalTeamMembers - prevTeamMembers

    const stats = [
        {
            name: "Total Projects",
            value: totalProjects.toString(),
            icon: BarChart3,
            change: `${parseFloat(projectsChange) >= 0 ? '+' : ''}${projectsChange}%`,
            changeType: parseFloat(projectsChange) >= 0 ? "positive" : "negative",
            href: "/dashboard/projects",
        },
        {
            name: "Active Tasks",
            value: activeTasks.toString(),
            icon: Clock,
            change: `${parseFloat(tasksChange) >= 0 ? '+' : ''}${tasksChange}%`,
            changeType: parseFloat(tasksChange) >= 0 ? "positive" : "negative",
            href: "/dashboard/tasks?status=IN_PROGRESS",
        },
        {
            name: "Completed Tasks",
            value: completedTasks.toString(),
            icon: CheckCircle,
            change: `${parseFloat(completedChange) >= 0 ? '+' : ''}${completedChange}%`,
            changeType: parseFloat(completedChange) >= 0 ? "positive" : "negative",
            href: "/dashboard/tasks?status=COMPLETED",
        },
        {
            name: "Team Members",
            value: totalTeamMembers.toString(),
            icon: Users,
            change: `${membersChange >= 0 ? '+' : ''}${membersChange}`,
            changeType: membersChange >= 0 ? "positive" : "negative",
            href: "/admin/users",
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Link key={stat.name} href={stat.href}>
                    <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer h-full">
                        <dt>
                            <div className="absolute bg-blue-500 rounded-md p-3">
                                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 text-sm font-medium text-gray-700 truncate">
                                {stat.name}
                            </p>
                        </dt>
                        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            <p
                                className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === "positive"
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                            >
                                {stat.change}
                            </p>
                        </dd>
                    </div>
                </Link>
            ))}
        </div>
    )
}