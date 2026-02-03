// Employee Types
export enum EmployeeType {
    FTE = 'FTE',      // Full-Time Employee
    CWT = 'CWT',      // Contract Worker
    COOP = 'CO-OP',   // Co-op Student
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeType: EmployeeType;
    monthlyRate: number;
    managerId?: string; // Reference to another employee
    teamName: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Allocation {
    id: string;
    projectId: string;
    employeeId: string;
    month: string; // ISO format: YYYY-MM-01
    percentage: number; // 0 to 1 (0% to 100%)
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AllocationGridRow {
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    teamName: string;
    allocations: {
        [monthKey: string]: number; // month -> percentage
    };
}
