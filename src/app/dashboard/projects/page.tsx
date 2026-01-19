import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { getAllProjects } from "@/lib/data"
import ProjectViewSelectorClient from "@/components/dashboard/project-view-selector-client"

export default async function ProjectsPage() {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const projects = await getAllProjects()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800'
            case 'IN_REVIEW':
                return 'bg-yellow-100 text-yellow-800'
            case 'PLANNING':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

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
                        <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
                    </div>
                    <Link
                        href="/dashboard/projects/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Project
                    </Link>
                </div>

                {/* Project View Selector */}
                <ProjectViewSelectorClient projects={projects} />
            </div>
        </div>
    )
}