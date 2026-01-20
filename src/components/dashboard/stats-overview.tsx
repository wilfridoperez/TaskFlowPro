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
    const completedTasks = allTasks.filter(t => t.status === 'DONE').length
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
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
            {stats.map((stat) => (
                <Link key={stat.name} href={stat.href}>
                    <div className="relative bg-white pt-2 px-2 pb-3 sm:pt-3 sm:px-3 sm:pb-4 lg:pt-4 lg:px-5 lg:pb-6 shadow rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer h-full">
                        <dt>
                            <div className="absolute bg-blue-500 rounded-md p-1.5 sm:p-2 lg:p-2.5">
                                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-9 sm:ml-11 lg:ml-14 text-xs font-medium text-gray-700 truncate leading-tight">
                                {stat.name}
                            </p>
                        </dt>
                        <dd className="ml-9 sm:ml-11 lg:ml-14 pt-0.5 flex items-baseline">
                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">{stat.value}</p>
                            <p
                                className={`ml-1 sm:ml-1.5 flex items-baseline text-xs font-semibold ${stat.changeType === "positive"
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