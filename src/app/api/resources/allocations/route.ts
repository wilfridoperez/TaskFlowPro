import { NextRequest, NextResponse } from 'next/server';
import { mockAllocations } from '@/lib/mock-resources';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('projectId');
        const month = searchParams.get('month');

        let filtered = mockAllocations;

        if (projectId) {
            filtered = filtered.filter((alloc) => alloc.projectId === projectId);
        }

        if (month) {
            filtered = filtered.filter((alloc) => alloc.month === month);
        }

        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Error fetching allocations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch allocations' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.projectId || !body.employeeId || !body.month) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate percentage is between 0 and 1
        if (
            typeof body.percentage !== 'number' ||
            body.percentage < 0 ||
            body.percentage > 1
        ) {
            return NextResponse.json(
                { error: 'Percentage must be between 0 and 1' },
                { status: 400 }
            );
        }

        const newId = `alloc-${(mockAllocations.length + 1).toString().padStart(3, '0')}`;

        const newAllocation = {
            id: newId,
            projectId: body.projectId,
            employeeId: body.employeeId,
            month: body.month,
            percentage: body.percentage,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // In a real app, this would save to database
        return NextResponse.json(newAllocation, { status: 201 });
    } catch (error) {
        console.error('Error creating allocation:', error);
        return NextResponse.json(
            { error: 'Failed to create allocation' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.id) {
            return NextResponse.json(
                { error: 'Allocation ID is required' },
                { status: 400 }
            );
        }

        // Validate percentage
        if (
            typeof body.percentage !== 'number' ||
            body.percentage < 0 ||
            body.percentage > 1
        ) {
            return NextResponse.json(
                { error: 'Percentage must be between 0 and 1' },
                { status: 400 }
            );
        }

        const updatedAllocation = {
            ...body,
            updatedAt: new Date(),
        };

        return NextResponse.json(updatedAllocation);
    } catch (error) {
        console.error('Error updating allocation:', error);
        return NextResponse.json(
            { error: 'Failed to update allocation' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const allocationId = searchParams.get('id');

        if (!allocationId) {
            return NextResponse.json(
                { error: 'Allocation ID is required' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, deletedId: allocationId });
    } catch (error) {
        console.error('Error deleting allocation:', error);
        return NextResponse.json(
            { error: 'Failed to delete allocation' },
            { status: 500 }
        );
    }
}
