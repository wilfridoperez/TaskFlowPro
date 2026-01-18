'use client'

import Link from 'next/link'
import { Users, Tag, Settings } from 'lucide-react'

export default function AdminDashboard() {
    const adminCards = [
        {
            title: 'Users Management',
            description: 'Manage system users and their roles',
            icon: Users,
            href: '/admin/users',
            color: 'bg-blue-500'
        },
        {
            title: 'Task Statuses',
            description: 'Create and manage task status options',
            icon: Tag,
            href: '/admin/statuses',
            color: 'bg-purple-500'
        },
        {
            title: 'Settings',
            description: 'Application configuration and preferences',
            icon: Settings,
            href: '/admin/settings',
            color: 'bg-green-500'
        },
    ]

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Admin Panel</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Link
                            key={card.href}
                            href={card.href}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
                        >
                            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                            <p className="text-sm text-gray-600">{card.description}</p>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Quick Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-blue-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900">5</p>
                    </div>
                    <div>
                        <p className="text-sm text-blue-600">Task Statuses</p>
                        <p className="text-2xl font-bold text-blue-900">3</p>
                    </div>
                    <div>
                        <p className="text-sm text-blue-600">Total Projects</p>
                        <p className="text-2xl font-bold text-blue-900">1</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
