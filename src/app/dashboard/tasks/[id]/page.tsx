import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
    const session = await auth()

    if (!session) {
        redirect("/auth/signin")
    }

    const taskId = params.id

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center">
                    <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Task #{taskId}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h2 className="text-lg font-semibold mb-2">Task Description</h2>
                                <p className="text-gray-600">Task details and progress will be displayed here.</p>
                            </div>
                        </div>

                        <div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-2">Task Status</h3>
                                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">In Progress</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}