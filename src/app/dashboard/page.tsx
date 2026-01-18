import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { Plus, Settings } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth()
    console.log("Dashboard auth() result:", session)

    // Session is guaranteed by middleware, but we still need user info for display
    if (!session?.user) {
        console.log("No user in session, redirecting to signin")
        redirect("/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {session.user?.name || "User"}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/admin"
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                            >
                                <Settings className="h-5 w-5 mr-2" />
                                Admin
                            </Link>
                            <Link
                                href="/dashboard/projects/new"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                New Project
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Stats Overview */}
                    <StatsOverview />

                    {/* Projects and Recent Tasks */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <ProjectGrid />
                        <RecentTasks />
                    </div>
                </div>
            </div>
        </div>
    )
}