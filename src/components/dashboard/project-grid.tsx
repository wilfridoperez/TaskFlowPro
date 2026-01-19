import Link from "next/link"
import { getAllProjects } from "@/lib/data"
import ProjectGridItem from "./project-grid-item"

export async function ProjectGrid() {
    const projects = (await getAllProjects()).slice(0, 3)

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Projects
                </h3>
                <Link
                    href="/dashboard/projects"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View all
                </Link>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {projects.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6">
                            <p className="text-gray-500">No projects yet. <Link href="/dashboard/projects/new" className="text-blue-600 hover:text-blue-700">Create one</Link></p>
                        </li>
                    ) : (
                        projects.map((project) => (
                            <ProjectGridItem key={project.id} project={project} />
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}