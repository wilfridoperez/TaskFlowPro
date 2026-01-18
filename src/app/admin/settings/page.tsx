'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        appName: 'TaskFlow Pro',
        appDescription: 'Modern SaaS Project Management Platform',
        maxProjectsPerUser: '10',
        maxUsersPerProject: '50',
        taskDependenciesEnabled: true,
        ganttChartEnabled: true,
        notificationsEnabled: true,
        emailNotifications: true,
        supportEmail: 'support@taskflow.com',
        maintenanceMode: false,
    })

    const [saved, setSaved] = useState(false)

    const handleChange = (field: string, value: any) => {
        setSettings({ ...settings, [field]: value })
        setSaved(false)
    }

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Settings</h2>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

            {saved && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    ✓ Settings saved successfully!
                </div>
            )}

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
                            <input
                                type="text"
                                value={settings.appName}
                                onChange={(e) => handleChange('appName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Application Description</label>
                            <textarea
                                value={settings.appDescription}
                                onChange={(e) => handleChange('appDescription', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                            <input
                                type="email"
                                value={settings.supportEmail}
                                onChange={(e) => handleChange('supportEmail', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Limits & Quotas */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Limits & Quotas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Projects Per User</label>
                            <input
                                type="number"
                                value={settings.maxProjectsPerUser}
                                onChange={(e) => handleChange('maxProjectsPerUser', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Users Per Project</label>
                            <input
                                type="number"
                                value={settings.maxUsersPerProject}
                                onChange={(e) => handleChange('maxUsersPerProject', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Feature Toggles */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Toggles</h3>
                    <div className="space-y-3">
                        {[
                            { key: 'taskDependenciesEnabled', label: 'Task Dependencies' },
                            { key: 'ganttChartEnabled', label: 'Gantt Chart' },
                            { key: 'notificationsEnabled', label: 'Notifications' },
                            { key: 'emailNotifications', label: 'Email Notifications' },
                        ].map((feature) => (
                            <label key={feature.key} className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings[feature.key as keyof typeof settings] as boolean}
                                    onChange={(e) => handleChange(feature.key, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="ml-3 text-sm text-gray-700">{feature.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-700">
                            Maintenance Mode
                            <span className="block text-xs text-gray-500 mt-1">When enabled, only admins can access the app</span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    )
}
