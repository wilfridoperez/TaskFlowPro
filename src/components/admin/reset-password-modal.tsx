'use client'

import { useState } from 'react'
import { X, Key } from 'lucide-react'
import { adminResetPassword } from '@/lib/actions'

interface ResetPasswordModalProps {
    userId: string
    userName: string
    userEmail: string
    isOpen: boolean
    onClose: () => void
}

export default function ResetPasswordModal({
    userId,
    userName,
    userEmail,
    isOpen,
    onClose,
}: ResetPasswordModalProps) {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate
        if (!newPassword || !confirmPassword) {
            setError('All fields are required')
            return
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const result = await adminResetPassword(userId, newPassword)
            if (result.success) {
                setSuccess(true)
                setNewPassword('')
                setConfirmPassword('')
                setTimeout(() => {
                    onClose()
                    setSuccess(false)
                }, 2000)
            } else {
                setError(result.error || 'Failed to reset password')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-700 hover:text-gray-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="text-center py-4">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-xl text-green-600">✓</span>
                            </div>
                            <p className="text-green-800 font-medium">Password reset successfully!</p>
                            <p className="text-sm text-gray-600 mt-2">User will receive a notification email.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} className="space-y-4">
                            {/* User Info */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900">{userName}</p>
                                <p className="text-xs text-gray-600">{userEmail}</p>
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Warning */}
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    ⚠️ A notification email will be sent to the user with their new password.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !newPassword || !confirmPassword}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
