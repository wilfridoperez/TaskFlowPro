import { Employee, Allocation, EmployeeType } from '@/types/resources';

// Mock Employees Data
export const mockEmployees: Employee[] = [
    {
        id: 'emp-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        employeeType: EmployeeType.FTE,
        monthlyRate: 8000,
        managerId: undefined,
        teamName: 'Engineering',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'emp-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        employeeType: EmployeeType.FTE,
        monthlyRate: 7500,
        managerId: 'emp-001',
        teamName: 'Engineering',
        createdAt: new Date('2023-03-20'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'emp-003',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@company.com',
        employeeType: EmployeeType.CWT,
        monthlyRate: 6500,
        managerId: 'emp-001',
        teamName: 'Engineering',
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'emp-004',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@company.com',
        employeeType: EmployeeType.FTE,
        monthlyRate: 7200,
        managerId: undefined,
        teamName: 'Design',
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'emp-005',
        firstName: 'Alex',
        lastName: 'Wilson',
        email: 'alex.wilson@company.com',
        employeeType: EmployeeType.COOP,
        monthlyRate: 3000,
        managerId: 'emp-004',
        teamName: 'Design',
        createdAt: new Date('2023-09-05'),
        updatedAt: new Date('2024-01-15'),
    },
    {
        id: 'emp-006',
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david.martinez@company.com',
        employeeType: EmployeeType.FTE,
        monthlyRate: 8500,
        managerId: undefined,
        teamName: 'Project Management',
        createdAt: new Date('2022-11-20'),
        updatedAt: new Date('2024-01-15'),
    },
];

// Mock Allocations Data
export const mockAllocations: Allocation[] = [
    {
        id: 'alloc-001',
        projectId: 'proj-001',
        employeeId: 'emp-001',
        month: '2026-01-01',
        percentage: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'alloc-002',
        projectId: 'proj-001',
        employeeId: 'emp-002',
        month: '2026-01-01',
        percentage: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'alloc-003',
        projectId: 'proj-002',
        employeeId: 'emp-002',
        month: '2026-01-01',
        percentage: 0.2,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'alloc-004',
        projectId: 'proj-001',
        employeeId: 'emp-003',
        month: '2026-01-01',
        percentage: 0.6,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'alloc-005',
        projectId: 'proj-002',
        employeeId: 'emp-004',
        month: '2026-01-01',
        percentage: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'alloc-006',
        projectId: 'proj-002',
        employeeId: 'emp-005',
        month: '2026-01-01',
        percentage: 0.5,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

// Helper function to get employee by ID
export function getEmployeeById(id: string): Employee | undefined {
    return mockEmployees.find((emp) => emp.id === id);
}

// Helper function to get allocations for a project
export function getAllocationsForProject(projectId: string): Allocation[] {
    return mockAllocations.filter((alloc) => alloc.projectId === projectId);
}

// Helper function to get allocations for an employee in a month
export function getAllocationsForEmployeeMonth(
    employeeId: string,
    month: string
): Allocation[] {
    return mockAllocations.filter(
        (alloc) => alloc.employeeId === employeeId && alloc.month === month
    );
}

// Helper function to get total allocation for employee in a month
export function getTotalAllocationForEmployeeMonth(
    employeeId: string,
    month: string
): number {
    const allocations = getAllocationsForEmployeeMonth(employeeId, month);
    return allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
}
