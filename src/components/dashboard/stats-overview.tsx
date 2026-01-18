import { BarChart3, CheckCircle, Clock, Users } from "lucide-react"

export function StatsOverview() {
    const stats = [
        {
            name: "Total Projects",
            value: "12",
            icon: BarChart3,
            change: "+2.3%",
            changeType: "positive",
        },
        {
            name: "Active Tasks",
            value: "48",
            icon: Clock,
            change: "+12%",
            changeType: "positive",
        },
        {
            name: "Completed Tasks",
            value: "156",
            icon: CheckCircle,
            change: "+8.1%",
            changeType: "positive",
        },
        {
            name: "Team Members",
            value: "8",
            icon: Users,
            change: "+1",
            changeType: "positive",
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.name}
                    className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                >
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
            ))}
        </div>
    )
}