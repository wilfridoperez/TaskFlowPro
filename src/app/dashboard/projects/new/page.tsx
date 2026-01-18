'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions'

export default function NewProjectPage() {
    const router = useRouter()
    const mockUsers: any[] = [] // TODO: Fetch users from API endpoint instead
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'ACTIVE',
        startDate: '',
        endDate: '',
        budget: ''
    })
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleMemberToggle = (userId: string) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.name && formData.description) {
            try {
                createProject({
                    name: formData.name,
                    description: formData.description,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    budget: formData.budget,
                    userId: "mock-user",
                    teamMembers: selectedMembers
                })
                setSubmitted(true)
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1500)
            } catch (error) {
                console.error('Error creating project:', error)
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
                    <p className="text-gray-600 mt-2">Start a new project and organize your team</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        {submitted && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 font-medium">✅ Project created successfully! Redirecting...</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Project Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Website Redesign"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your project..."
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>

                            {/* Start and End Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Budget */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Budget (USD)
                                </label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Team Members */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Team Members
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4 bg-gray-100 space-y-3 max-h-64 overflow-y-auto">
                                    {mockUsers.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No users available</p>
                                    ) : (
                                        mockUsers.map(user => (
                                            <label key={user.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(user.id)}
                                                    onChange={() => handleMemberToggle(user.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {selectedMembers.length > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitted}
                                    className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                >
                                    Create Project
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}