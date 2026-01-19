'use client'

import { useState } from 'react'
import { Trash2, Edit2, Plus, Key } from 'lucide-react'
import { createUser, updateUser, deleteUser } from '@/lib/actions'
import ResetPasswordModal from './reset-password-modal'

interface User {
    id: string
    name: string | null
    email: string
    avatar?: string
    role: 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
}

interface UsersManagementClientProps {
    initialUsers: User[]
}

export default function UsersManagementClient({ initialUsers }: UsersManagementClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', role: 'USER' as 'USER' | 'ADMIN' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<User | null>(null)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleAddUser = async () => {
        if (!formData.name || !formData.email) {
            setError('Name and email are required')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (editingId) {
                // Update existing user
                const result = await updateUser(editingId, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                })

                if (result.success && result.user) {
                    setUsers(users.map(u => u.id === editingId ? {
                        ...u,
                        name: result.user.name || u.name,
                        email: result.user.email,
                        role: result.user.role
                    } : u))
                    setSuccess('User updated successfully')
                    setEditingId(null)
                } else {
                    setError(result.error || 'Failed to update user')
                }
            } else {
                // Create new user
                const result = await createUser({
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                })

                if (result.success && result.user) {
                    const newUser: User = {
                        id: result.user.id,
                        name: result.user.name || null,
                        email: result.user.email,
                        role: result.user.role,
                        status: 'ACTIVE',
                        createdAt: new Date().toISOString().split('T')[0]
                    }
                    setUsers([...users, newUser])
                    setSuccess('User created successfully')
                } else {
                    setError(result.error || 'Failed to create user')
                }
            }

            setFormData({ name: '', email: '', role: 'USER' })
            setShowForm(false)
        } catch (err) {
            setError('An error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (user: User) => {
        setFormData({ name: user.name || '', email: user.email, role: user.role })
        setEditingId(user.id)
        setShowForm(true)
        setError('')
        setSuccess('')
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const result = await deleteUser(id)

            if (result.success) {
                setUsers(users.filter(u => u.id !== id))
                setSuccess('User deleted successfully')
            } else {
                setError(result.error || 'Failed to delete user')
            }
        } catch (err) {
            setError('An error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = (user: User) => {
        setSelectedUserForPasswordReset(user)
        setIsPasswordModalOpen(true)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm)
                        setEditingId(null)
                        setFormData({ name: '', email: '', role: 'USER' })
                        setError('')
                        setSuccess('')
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    {success}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit User' : 'New User'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="Enter user name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="Enter email address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'USER' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddUser}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (editingId ? 'Update User' : 'Create User')}
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingId(null)
                                    setFormData({ name: '', email: '', role: 'USER' })
                                    setError('')
                                    setSuccess('')
                                }}
                                disabled={loading}
                                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {users.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        <p>No users found. Create one to get started.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name || 'No Name'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                                    <td className="px-6 py-4 text-sm flex gap-2">
                                        <button
                                            onClick={() => handleResetPassword(user)}
                                            className="text-purple-600 hover:text-purple-800 p-1 rounded hover:bg-purple-50"
                                            title="Reset password"
                                        >
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                            title="Edit user"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                            title="Delete user"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedUserForPasswordReset && (
                <ResetPasswordModal
                    userId={selectedUserForPasswordReset.id}
                    userName={selectedUserForPasswordReset.name}
                    userEmail={selectedUserForPasswordReset.email}
                    isOpen={isPasswordModalOpen}
                    onClose={() => {
                        setIsPasswordModalOpen(false)
                        setSelectedUserForPasswordReset(null)
                    }}
                />
            )}
        </div>
    )
}
