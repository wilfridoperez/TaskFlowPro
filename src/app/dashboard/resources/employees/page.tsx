'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeType } from '@/types/resources';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        employeeType: EmployeeType.FTE,
        monthlyRate: 0,
        managerId: '',
        teamName: '',
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    async function fetchEmployees() {
        try {
            const response = await fetch('/api/resources/employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            employeeType: EmployeeType.FTE,
            monthlyRate: 0,
            managerId: '',
            teamName: '',
        });
        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(employee: Employee) {
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            employeeType: employee.employeeType,
            monthlyRate: employee.monthlyRate,
            managerId: employee.managerId || '',
            teamName: employee.teamName,
        });
        setEditingId(employee.id);
        setShowForm(true);
    }

    async function handleSave() {
        if (!formData.firstName || !formData.lastName || !formData.email) {
            alert('Please fill in required fields');
            return;
        }

        try {
            if (editingId) {
                await fetch('/api/resources/employees', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...formData }),
                });
            } else {
                await fetch('/api/resources/employees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }
            await fetchEmployees();
            resetForm();
        } catch (error) {
            console.error('Error saving:', error);
        }
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this employee?')) {
            try {
                await fetch(`/api/resources/employees?id=${id}`, { method: 'DELETE' });
                await fetchEmployees();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    }

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                            <p className="text-gray-600">Manage your team members</p>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {showForm ? 'Cancel' : 'Add Employee'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {showForm && (
                    <div className="mb-8 p-6 border rounded-lg bg-white shadow">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            {editingId ? 'Edit' : 'Add'} Employee
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Team Name"
                                value={formData.teamName}
                                onChange={(e) =>
                                    setFormData({ ...formData, teamName: e.target.value })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={formData.employeeType}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        employeeType: e.target.value as EmployeeType,
                                    })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={EmployeeType.FTE}>FTE</option>
                                <option value={EmployeeType.CWT}>CWT</option>
                                <option value={EmployeeType.COOP}>CO-OP</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Monthly Rate"
                                value={formData.monthlyRate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        monthlyRate: parseFloat(e.target.value),
                                    })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                                value={formData.managerId}
                                onChange={(e) =>
                                    setFormData({ ...formData, managerId: e.target.value })
                                }
                                className="border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Manager (optional)</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-900">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-900">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-900">Team</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-900">Rate</th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-900">
                                        {emp.firstName} {emp.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                                    <td className="px-4 py-3 text-gray-900">{emp.employeeType}</td>
                                    <td className="px-4 py-3 text-gray-600">{emp.teamName}</td>
                                    <td className="px-4 py-3 text-gray-900">${emp.monthlyRate}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleEdit(emp)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp.id)}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:underline ml-2"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
