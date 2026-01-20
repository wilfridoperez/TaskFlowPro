export interface User {
    id: string
    name?: string
    email: string
    image?: string
    role: UserRole
    subscription: SubscriptionPlan
    stripeCustomerId?: string
    createdAt: Date
    updatedAt: Date
}

export interface Project {
    id: string
    name: string
    description?: string
    status: ProjectStatus
    startDate?: Date
    endDate?: Date
    budget?: number
    ownerId: string
    createdAt: Date
    updatedAt: Date
}

export interface Task {
    id: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    dueDate?: Date
    estimatedHours?: number
    actualHours?: number
    tags: string[]
    projectId: string
    assigneeId?: string
    createdAt: Date
    updatedAt: Date
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum SubscriptionPlan {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
}

export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum TeamRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER'
}