/**
 * Centralized Mock Data Module
 * 
 * This module contains all mock data for the application.
 * When transitioning to a database, replace the data source while keeping the same structure.
 */

export const MOCK_USERS = [
    { id: "user-1", name: "Alice Johnson", email: "alice@example.com", avatar: "AJ" },
    { id: "user-2", name: "Bob Smith", email: "bob@example.com", avatar: "BS" },
    { id: "user-3", name: "Carol Davis", email: "carol@example.com", avatar: "CD" },
    { id: "user-4", name: "David Wilson", email: "david@example.com", avatar: "DW" },
    { id: "user-5", name: "Eve Brown", email: "eve@example.com", avatar: "EB" }
]

export const MOCK_PROJECTS = [
    {
        id: "1",
        name: "TaskFlow Pro Development",
        description: "Building the next-generation SaaS project management platform with AI integration",
        status: "ACTIVE",
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-06-01'),
        budget: 500000,
        userId: "mock-user",
        teamMembers: ["user-1", "user-2", "user-3"],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "2",
        name: "Mobile App Launch",
        description: "Develop and launch TaskFlow Pro mobile application for iOS and Android",
        status: "PLANNING",
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-08-01'),
        budget: 300000,
        userId: "mock-user",
        teamMembers: ["user-4", "user-5"],
        createdAt: new Date(),
        updatedAt: new Date()
    }
]

export const MOCK_TASKS = [
    {
        id: "task-1",
        title: "Setup Project Infrastructure",
        description: "Initialize the project with proper folder structure and dependencies",
        status: "COMPLETED",
        priority: "HIGH",
        startDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-15'),
        projectId: "1",
        assignedTo: "user-1",
        dependsOn: [],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "task-2",
        title: "Implement Core Features",
        description: "Build the main functionality and user interface",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        startDate: new Date('2025-12-16'),
        dueDate: new Date('2026-01-15'),
        projectId: "1",
        assignedTo: "user-2",
        dependsOn: ["task-1"],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "task-3",
        title: "Testing & Quality Assurance",
        description: "Comprehensive testing and bug fixes",
        status: "TO DO",
        priority: "LOW",
        startDate: new Date('2026-01-16'),
        dueDate: new Date('2026-02-01'),
        projectId: "1",
        assignedTo: "user-3",
        dependsOn: ["task-2"],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "task-4",
        title: "API Development",
        description: "Build REST API endpoints and database integration",
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: new Date('2025-12-16'),
        dueDate: new Date('2026-01-20'),
        projectId: "1",
        assignedTo: "user-4",
        dependsOn: ["task-1"],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "task-5",
        title: "UI/UX Design Review",
        description: "Review and finalize design components",
        status: "TO DO",
        priority: "MEDIUM",
        startDate: new Date('2026-01-16'),
        dueDate: new Date('2026-01-25'),
        projectId: "1",
        assignedTo: "user-5",
        dependsOn: ["task-4"],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "task-6",
        title: "Documentation & Deployment Guide",
        description: "Write comprehensive documentation and deployment procedures",
        status: "TO DO",
        priority: "LOW",
        startDate: new Date('2026-02-02'),
        dueDate: new Date('2026-02-15'),
        projectId: "1",
        assignedTo: null,
        dependsOn: ["task-3"],
        createdAt: new Date(),
        updatedAt: new Date()
    }
]
