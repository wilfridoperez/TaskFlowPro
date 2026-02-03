'use client';

import { useState, useEffect } from 'react';
import { Employee, Allocation, EmployeeType } from '@/types/resources';

const MONTHS = [
    { value: '2026-01-01', label: 'January', short: 'Jan' },
    { value: '2026-02-01', label: 'February', short: 'Feb' },
    { value: '2026-03-01', label: 'March', short: 'Mar' },
    { value: '2026-04-01', label: 'April', short: 'Apr' },
    { value: '2026-05-01', label: 'May', short: 'May' },
    { value: '2026-06-01', label: 'June', short: 'Jun' },
    { value: '2026-07-01', label: 'July', short: 'Jul' },
    { value: '2026-08-01', label: 'August', short: 'Aug' },
    { value: '2026-09-01', label: 'September', short: 'Sep' },
    { value: '2026-10-01', label: 'October', short: 'Oct' },
    { value: '2026-11-01', label: 'November', short: 'Nov' },
    { value: '2026-12-01', label: 'December', short: 'Dec' },
];

const PROJECTS = [
    { id: 'proj-001', name: 'Project Alpha' },
    { id: 'proj-002', name: 'Project Beta' },
    { id: 'proj-003', name: 'Project Gamma' },
];

interface GridData {
    [employeeId: string]: {
        [month: string]: number;
    };
}

export default function AllocationGridPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [selectedProject, setSelectedProject] = useState('proj-001');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gridData, setGridData] = useState<GridData>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
    const [selectedEmployeeToAdd, setSelectedEmployeeToAdd] = useState<string>('');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load initial data
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchEmployees(), fetchAllocations()])
            .then(() => setLoading(false))
            .catch((error) => {
                console.error('Failed to load data:', error);
                setLoading(false);
            });
    }, []);

    // Update grid when project or allocations change
    useEffect(() => {
        if (mounted && employees.length > 0) {
            buildGrid();
        }
    }, [employees, allocations, selectedProject, mounted]);

    async function fetchEmployees() {
        try {
            const response = await fetch('/api/resources/employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    }

    async function fetchAllocations() {
        try {
            const response = await fetch('/api/resources/allocations');
            const data = await response.json();
            setAllocations(data);
        } catch (error) {
            console.error('Error fetching allocations:', error);
        }
    }

    function buildGrid() {
        const newGrid: GridData = {};

        employees.forEach((emp) => {
            newGrid[emp.id] = {};

            MONTHS.forEach((month) => {
                const allocation = allocations.find(
                    (a) =>
                        a.employeeId === emp.id &&
                        a.projectId === selectedProject &&
                        a.month === month.value
                );

                newGrid[emp.id][month.value] = allocation
                    ? Math.round(allocation.percentage * 100)
                    : 0;
            });
        });

        setGridData(newGrid);
        setHasChanges(false);
    }

    function updateAllocationPercentage(employeeId: string, month: string, percentage: number) {
        const clamped = Math.max(0, Math.min(100, percentage));

        setGridData((prev) => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [month]: clamped,
            },
        }));

        setHasChanges(true);
    }

    async function saveAllocations() {
        setSaving(true);
        try {
            for (const employeeId of Object.keys(gridData)) {
                for (const month of MONTHS.map((m) => m.value)) {
                    const percentage = gridData[employeeId][month] || 0;
                    const decimalPercentage = percentage / 100;

                    const existing = allocations.find(
                        (a) =>
                            a.employeeId === employeeId &&
                            a.projectId === selectedProject &&
                            a.month === month
                    );

                    if (decimalPercentage > 0) {
                        if (existing) {
                            await fetch('/api/resources/allocations', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id: existing.id,
                                    projectId: selectedProject,
                                    employeeId,
                                    month,
                                    percentage: decimalPercentage,
                                }),
                            });
                        } else {
                            await fetch('/api/resources/allocations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    projectId: selectedProject,
                                    employeeId,
                                    month,
                                    percentage: decimalPercentage,
                                }),
                            });
                        }
                    } else if (existing) {
                        await fetch(`/api/resources/allocations?id=${existing.id}`, {
                            method: 'DELETE',
                        });
                    }
                }
            }

            await fetchAllocations();
            setHasChanges(false);
            alert('Allocations saved successfully!');
        } catch (error) {
            console.error('Error saving allocations:', error);
            alert('Failed to save allocations');
        } finally {
            setSaving(false);
        }
    }

    // Employee management functions
    function handleAddEmployee() {
        if (!selectedEmployeeToAdd) {
            alert('Please select an employee');
            return;
        }

        // Check if employee is already in the grid
        if (gridData[selectedEmployeeToAdd]) {
            alert('Employee already added to allocations');
            return;
        }

        // Add employee to grid with zero allocations
        const newGridData = { ...gridData };
        newGridData[selectedEmployeeToAdd] = {};
        MONTHS.forEach((month) => {
            newGridData[selectedEmployeeToAdd][month.value] = 0;
        });
        setGridData(newGridData);
        setSelectedEmployeeToAdd('');
        setShowAddEmployeeForm(false);
    }

    function handleRemoveEmployee(employeeId: string) {
        if (confirm('Remove this employee from allocations?')) {
            const newGridData = { ...gridData };
            delete newGridData[employeeId];
            setGridData(newGridData);
            setHasChanges(true);
        }
    }

    // Get employees not yet in the grid
    const availableEmployees = employees.filter((emp) => !gridData[emp.id]);

    if (!mounted) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">Loading...</div>
                    <div className="text-sm text-gray-600 mt-2">Fetching employee and allocation data</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
            {/* Header */}
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-2xl font-bold text-gray-900">Resource Allocation</h1>
                        <p className="text-gray-600">Manage annual allocations across all 12 months</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {employees.length === 0 ? (
                    <div className="rounded-lg bg-amber-50 p-6 text-center text-amber-900">
                        <p className="font-semibold">No employees found</p>
                        <p className="text-sm mt-2">Please add employees first to manage allocations</p>
                    </div>
                ) : (
                    <>
                        {/* Project Selector */}
                        <div className="mb-6 flex gap-4 bg-white p-4 rounded-lg shadow">
                            <div className="w-64">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Project
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedProject(e.currentTarget.value)}
                                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {PROJECTS.map((proj) => (
                                        <option key={proj.id} value={proj.id}>
                                            {proj.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 12-Month Allocation Grid */}
                        <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    {/* Year Header Row */}
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-700 min-w-48">
                                        </th>
                                        <th colSpan={12} className="border-r border-gray-200 px-4 py-2 text-center font-bold text-gray-900 text-lg">
                                            2026
                                        </th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-700"></th>
                                    </tr>
                                    {/* Month Header Row */}
                                    <tr className="border-b border-gray-200 bg-gray-100">
                                        <th className="sticky left-0 z-10 border-r border-gray-200 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-900 min-w-48">
                                            Employee
                                        </th>
                                        {MONTHS.map((month) => (
                                            <th
                                                key={month.value}
                                                className="border-r border-gray-200 px-3 py-3 text-center font-semibold text-gray-900 min-w-20"
                                                title={month.label}
                                            >
                                                {month.short}
                                            </th>
                                        ))}
                                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-20">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => {
                                        const total = Object.values(gridData[emp.id] || {}).reduce((a, b) => a + b, 0);
                                        const totalPercentage = Math.min(100, total);

                                        return (
                                            <tr key={emp.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="sticky left-0 z-10 bg-white border-r border-gray-200 px-4 py-3 font-medium text-gray-900">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <div>{emp.firstName} {emp.lastName}</div>
                                                            <div className="text-xs text-gray-500">{emp.teamName}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveEmployee(emp.id)}
                                                            className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:underline whitespace-nowrap"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </td>
                                                {MONTHS.map((month) => (
                                                    <td
                                                        key={month.value}
                                                        className="border-r border-gray-200 px-3 py-3 text-center"
                                                    >
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="5"
                                                            value={gridData[emp.id]?.[month.value] || 0}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                                updateAllocationPercentage(
                                                                    emp.id,
                                                                    month.value,
                                                                    parseInt(e.target.value, 10) || 0
                                                                )
                                                            }
                                                            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                                                            className="w-full text-center border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            style={{ textAlign: 'center' }}
                                                        />
                                                    </td>
                                                ))}
                                                <td className={`px-4 py-3 text-center font-semibold ${totalPercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {totalPercentage}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {availableEmployees.length > 0 && (
                                        <tr className="border-b border-gray-200 bg-blue-50 hover:bg-blue-100">
                                            <td className="sticky left-0 z-10 bg-blue-50 border-r border-gray-200 px-4 py-3">
                                                <select
                                                    value={selectedEmployeeToAdd}
                                                    onChange={(e) => setSelectedEmployeeToAdd(e.target.value)}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="">+ Add Employee</option>
                                                    {availableEmployees.map((emp) => (
                                                        <option key={emp.id} value={emp.id}>
                                                            {emp.firstName} {emp.lastName} ({emp.teamName})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td colSpan={12} className="border-r border-gray-200 px-4 py-3 text-center">
                                                <button
                                                    onClick={handleAddEmployee}
                                                    disabled={!selectedEmployeeToAdd}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    Add
                                                </button>
                                            </td>
                                            <td className="px-4 py-3"></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {hasChanges && <span className="text-amber-600 font-medium">You have unsaved changes</span>}
                            </div>
                            <button
                                onClick={saveAllocations}
                                disabled={saving || !hasChanges}
                                className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1"
                            >
                                <span>{saving ? 'Saving...' : 'Save Allocations'}</span>
                                <span className="text-xs font-normal">
                                    Total: {Math.round(Object.values(gridData).reduce((sum, emp) => sum + Object.values(emp).reduce((a, b) => a + b, 0), 0))}% allocated
                                </span>
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                            <p className="font-semibold">How to use this grid:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• Enter allocation percentage (0-100) for each employee and month</li>
                                <li>• The "Total" column shows the sum across all months for each employee</li>
                                <li>• Red total indicates allocation exceeds 100% in a single month</li>
                                <li>• Click Save to commit all changes for the selected project</li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
