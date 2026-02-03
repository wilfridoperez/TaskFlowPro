'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader } from 'lucide-react'
import { addTeamMemberToProject } from '@/lib/actions'

interface User {
    id: string
    name: string | null
    email: string
}

interface AddTeamMemberModalProps {
    projectId: string
    allUsers: User[]
    currentTeamMemberIds: string[]
    onMemberAdded?: () => void
}

export default function AddTeamMemberModal({
    projectId,
    allUsers,
    currentTeamMemberIds,
    onMemberAdded
}: AddTeamMemberModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Filter out users already in the project
    const availableUsers = allUsers.filter(user => !currentTeamMemberIds.includes(user.id))

    const handleAddMember = async () => {
        if (!selectedUserId) {
            setError('Please select a user')
            return
        }

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const result = await addTeamMemberToProject(projectId, selectedUserId)

            if (result.success) {
                setSuccess(result.message || 'Team member added successfully')
                setSelectedUserId('')
                setTimeout(() => {
                    setIsOpen(false)
                    setSuccess(null)
                    onMemberAdded?.()
                }, 1500)
            } else {
                setError(result.error || 'Failed to add team member')
            }
        } catch (err) {
            setError('Failed to add team member')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                Add Team Member
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {availableUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">All users are already members of this project</p>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select User
                                        </label>
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => {
                                                setSelectedUserId(e.target.value)
                                                setError(null)
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        >
                                            <option value="">Choose a user...</option>
                                            {availableUsers.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name || user.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    {success && (
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700">{success}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddMember}
                                            disabled={isLoading || !selectedUserId}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                                            {isLoading ? 'Adding...' : 'Add Member'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
