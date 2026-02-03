
export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
                        <p className="text-gray-600">
                            Manage your team members and allocate them to projects efficiently.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Employees Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Employees</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Add, edit, and manage team members. Track their roles, rates, and team assignments.
                            </p>
                        </div>
                        <a href="/dashboard/resources/employees">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                Manage Employees
                            </button>
                        </a>
                    </div>

                    {/* Allocations Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:shadow-lg transition-shadow">
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Allocations</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Quickly assign employees to projects using our fast grid interface. Perfect for managers.
                            </p>
                        </div>
                        <a href="/dashboard/resources/allocations">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                View Allocation Grid
                            </button>
                        </a>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-12">
                    <h2 className="mb-6 text-lg font-semibold text-gray-900">Quick Stats</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-blue-50 p-6 border border-blue-100">
                            <p className="text-sm text-gray-600">Total Employees</p>
                            <p className="mt-1 text-2xl font-bold text-blue-900">6</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-6 border border-green-100">
                            <p className="text-sm text-gray-600">Active Allocations</p>
                            <p className="mt-1 text-2xl font-bold text-green-900">6</p>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-6 border border-purple-100">
                            <p className="text-sm text-gray-600">Projects</p>
                            <p className="mt-1 text-2xl font-bold text-purple-900">3</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
