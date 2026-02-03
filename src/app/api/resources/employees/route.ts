import { NextRequest, NextResponse } from 'next/server';
import { mockEmployees } from '@/lib/mock-resources';

export async function GET(request: NextRequest) {
    try {
        return NextResponse.json(mockEmployees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json(
            { error: 'Failed to fetch employees' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.firstName || !body.lastName || !body.email || !body.employeeType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate new ID
        const newId = `emp-${(mockEmployees.length + 1).toString().padStart(3, '0')}`;

        const newEmployee = {
            id: newId,
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            employeeType: body.employeeType,
            monthlyRate: body.monthlyRate || 0,
            managerId: body.managerId || undefined,
            teamName: body.teamName || '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // In a real app, this would save to database
        // For now, we just return the new employee
        return NextResponse.json(newEmployee, { status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json(
            { error: 'Failed to create employee' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // In a real app, this would update in database
        const updatedEmployee = {
            ...body,
            updatedAt: new Date(),
        };

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error('Error updating employee:', error);
        return NextResponse.json(
            { error: 'Failed to update employee' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('id');

        if (!employeeId) {
            return NextResponse.json(
                { error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // In a real app, this would delete from database
        return NextResponse.json({ success: true, deletedId: employeeId });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json(
            { error: 'Failed to delete employee' },
            { status: 500 }
        );
    }
}
