'use client'

import { useState } from 'react'
import { DollarSign, Save, Download, CheckCircle } from 'lucide-react'
import { saveAllocations } from '@/lib/actions'

interface TeamMember {
    id: string
    name?: string
    email: string
    role?: string
}

interface MonthlyAllocationsEditorProps {
    project: any
    teamMembers: TeamMember[]
    initialAllocations?: Record<number, Record<string, number>>
}

const MONTHS = [
    { short: 'Jan', full: 'January' },
    { short: 'Feb', full: 'February' },
    { short: 'Mar', full: 'March' },
    { short: 'Apr', full: 'April' },
    { short: 'May', full: 'May' },
    { short: 'Jun', full: 'June' },
    { short: 'Jul', full: 'July' },
    { short: 'Aug', full: 'August' },
    { short: 'Sep', full: 'September' },
    { short: 'Oct', full: 'October' },
    { short: 'Nov', full: 'November' },
    { short: 'Dec', full: 'December' }
]

type AllocationMatrix = Record<number, Record<string, number>> // memberIndex -> month -> percentage

export default function MonthlyAllocationsEditor({ project, teamMembers, initialAllocations }: MonthlyAllocationsEditorProps) {
    const [allocations, setAllocations] = useState<AllocationMatrix>(
        initialAllocations || Object.fromEntries(
            teamMembers.map((_, index) => [
                index.toString(),
                Object.fromEntries(
                    MONTHS.map(month => [month.short, 0])
                )
            ])
        )
    )
    const [isSaving, setIsSaving] = useState(false)
    const [editingCell, setEditingCell] = useState<{ memberIndex: number; month: string } | null>(null)
    const [originalValue, setOriginalValue] = useState<number | null>(null)
    const [hasChanges, setHasChanges] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const projectBudget = project.budget || 0

    const handleAllocationChange = (memberIndex: number, month: string, percentage: number) => {
        setAllocations(prev => ({
            ...prev,
            [memberIndex]: {
                ...prev[memberIndex],
                [month]: percentage
            }
        }))
        setHasChanges(true)
        setSaveSuccess(false)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Get team member IDs for the action
            const teamMemberIds = teamMembers.map(m => m.id)

            // Save to database
            const result = await saveAllocations(project.id, allocations, teamMemberIds)

            if (result.success) {
                setSaveSuccess(true)
                setHasChanges(false)
                // Auto-hide success message after 4 seconds
                setTimeout(() => setSaveSuccess(false), 4000)
            }
        } catch (error) {
            console.error('Error saving allocations:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleExportCSV = () => {
        try {
            // Build CSV header
            const header = ['Employee', 'Email', 'Role', ...MONTHS.map(m => m.short), 'Total']
            const rows = [header]

            // Add data rows for each team member
            teamMembers.forEach((member, memberIndex) => {
                const row = [
                    member.name || member.email,
                    member.email,
                    member.role || 'Team Member',
                    ...MONTHS.map(month => getMemberMonthAllocation(memberIndex, month.short).toFixed(1)),
                    getMemberTotalAllocation(memberIndex).toFixed(1)
                ]
                rows.push(row)
            })

            // Add monthly total row
            const totalRow = [
                'Monthly Total',
                '',
                '',
                ...MONTHS.map(month => getMonthTotalAllocation(month.short).toFixed(1)),
                MONTHS.reduce((sum, month) => sum + getMonthTotalAllocation(month.short), 0).toFixed(1)
            ]
            rows.push(totalRow)

            // Convert to CSV string
            const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

            // Create blob and download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `allocations-${project.name || 'project'}-${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error exporting CSV:', error)
            alert('Failed to export allocations')
        }
    }

    const getMemberMonthAllocation = (memberIndex: number, month: string) => {
        return allocations[memberIndex]?.[month] || 0
    }

    const getMemberMonthBudget = (memberIndex: number, month: string) => {
        const percentage = getMemberMonthAllocation(memberIndex, month)
        return (projectBudget * percentage) / 100
    }

    const getMonthTotalAllocation = (month: string) => {
        return teamMembers.reduce((sum, _, index) => sum + getMemberMonthAllocation(index, month), 0)
    }

    const getMemberTotalAllocation = (memberIndex: number) => {
        return MONTHS.reduce((sum, month) => sum + getMemberMonthAllocation(memberIndex, month.short), 0)
    }

    return (
        <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Monthly Budget Allocation</h2>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total Budget: <span className="font-semibold text-gray-900">${projectBudget.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {teamMembers.length > 0 ? (
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50">Employee</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider sticky left-24 bg-gray-50">Role</th>
                                    {MONTHS.map(month => (
                                        <th key={month.short} className="px-0 py-0 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-20">
                                            {month.short}
                                        </th>
                                    ))}
                                    <th className="px-0 py-0 text-center text-xs font-medium text-gray-700 uppercase tracking-wider min-w-20 bg-blue-50 border-l border-gray-200">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teamMembers.map((member, memberIndex) => (
                                    <tr key={memberIndex} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 sticky left-0 bg-white hover:bg-gray-50 z-10">
                                            <div className="pl-2">
                                                <p className="font-medium text-gray-900 text-sm">{member.name || member.email}</p>
                                                <p className="text-xs text-gray-600">{member.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 sticky left-24 bg-white hover:bg-gray-50 z-10">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                                {member.role || 'Team Member'}
                                            </span>
                                        </td>
                                        {MONTHS.map(month => (
                                            <td key={`${memberIndex}-${month.short}`} className="px-0 py-0 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {editingCell?.memberIndex === memberIndex && editingCell?.month === month.short ? (
                                                        <input
                                                            type="number"
                                                            min="0.1"
                                                            max="100"
                                                            autoFocus
                                                            data-cell={`${memberIndex}-${month.short}`}
                                                            onFocus={(e) => e.target.select()}
                                                            value={getMemberMonthAllocation(memberIndex, month.short)}
                                                            onChange={(e) => handleAllocationChange(memberIndex, month.short, parseFloat(e.target.value) || 0)}
                                                            onBlur={() => setEditingCell(null)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    // Find the next cell: next month in same member, or first month of next member
                                                                    const currentMonthIndex = MONTHS.findIndex(m => m.short === month.short)
                                                                    let nextMemberIndex = memberIndex
                                                                    let nextMonthIndex = currentMonthIndex + 1

                                                                    if (nextMonthIndex >= MONTHS.length) {
                                                                        nextMonthIndex = 0
                                                                        nextMemberIndex = memberIndex + 1
                                                                    }

                                                                    if (nextMemberIndex < teamMembers.length) {
                                                                        const nextMonth = MONTHS[nextMonthIndex].short
                                                                        setOriginalValue(getMemberMonthAllocation(nextMemberIndex, nextMonth))
                                                                        setEditingCell({ memberIndex: nextMemberIndex, month: nextMonth })
                                                                    } else {
                                                                        // End of table, just exit edit mode
                                                                        setEditingCell(null)
                                                                    }
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    // Revert to original value
                                                                    if (originalValue !== null) {
                                                                        handleAllocationChange(memberIndex, month.short, originalValue)
                                                                    }
                                                                    setEditingCell(null)
                                                                    setOriginalValue(null)
                                                                }
                                                            }}
                                                            className="w-20 px-0 py-0 border-2 border-blue-500 rounded text-xs font-bold text-gray-900 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-outer-spin-button]:[-webkit-appearance:none] [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&]:[-moz-appearance:textfield]"
                                                        />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOriginalValue(getMemberMonthAllocation(memberIndex, month.short))
                                                                setEditingCell({ memberIndex, month: month.short })
                                                            }}
                                                            onKeyDown={(e) => {
                                                                // If a number key is pressed, enter edit mode with that number
                                                                if (/[0-9]/.test(e.key)) {
                                                                    e.preventDefault()
                                                                    const currentValue = getMemberMonthAllocation(memberIndex, month.short)
                                                                    setOriginalValue(currentValue)
                                                                    setEditingCell({ memberIndex, month: month.short })
                                                                    // Start with the number that was pressed
                                                                    setTimeout(() => {
                                                                        const input = document.querySelector(`input[data-cell="${memberIndex}-${month.short}"]`) as HTMLInputElement
                                                                        if (input) {
                                                                            input.value = e.key
                                                                            handleAllocationChange(memberIndex, month.short, parseFloat(e.key))
                                                                            input.focus()
                                                                        }
                                                                    }, 0)
                                                                }
                                                            }}
                                                            className="px-0 py-0 rounded text-xs font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                        >
                                                            {getMemberMonthAllocation(memberIndex, month.short).toFixed(1)}%
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="px-0 py-0 text-center bg-blue-50 border-l border-gray-200">
                                            <p className="text-xs font-bold text-blue-900">
                                                {getMemberTotalAllocation(memberIndex).toFixed(1)}%
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={2} className="px-3 py-2 font-semibold text-gray-900 text-sm">
                                        Monthly Total %:
                                    </td>
                                    {MONTHS.map(month => {
                                        const total = getMonthTotalAllocation(month.short)
                                        return (
                                            <td key={month.short} className="px-0 py-0 text-center">
                                                <p className="text-xs font-bold text-gray-900">
                                                    {total.toFixed(1)}%
                                                </p>
                                            </td>
                                        )
                                    })}
                                    <td className="px-0 py-0 text-center bg-blue-50 border-l border-gray-200">
                                        <p className="text-xs font-bold text-blue-900">
                                            {MONTHS.reduce((sum, month) => sum + getMonthTotalAllocation(month.short), 0).toFixed(1)}%
                                        </p>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200">
                        {saveSuccess && (
                            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-sm font-medium text-green-700">Allocations saved successfully!</p>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save Allocations'}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-6 py-8 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No team members assigned to allocate budget</p>
                </div>
            )}
        </div>
    )
}
