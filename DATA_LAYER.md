# Centralized Data Layer Documentation

## Overview

The application uses a centralized data layer that separates data access concerns from business logic. This architecture makes it easy to transition from mock data to a database without modifying component code.

## File Structure

### `src/lib/mock-data.ts`
Contains all mock data used by the application:
- `MOCK_USERS` - User profiles
- `MOCK_PROJECTS` - Project definitions
- `MOCK_TASKS` - Task definitions

**Key Benefit:** All mock data is in one place, making it easy to update or replace with database queries.

### `src/lib/data.ts`
Provides the complete data access API:
- Abstracts data operations (CRUD)
- Manages in-memory state during the session
- Provides a consistent interface for all data operations

## Data Operations

### User Operations

```typescript
// Get all users
getUsers(): User[]

// Get user by ID
getUserById(id: string): User | null

// Get multiple users by IDs
getUsersByIds(ids: string[]): User[]

// Get user by email
getUserByEmail(email: string): User | null
```

### Project Operations

```typescript
// Get all projects with tasks
getAllProjects(): Project[]

// Get single project
getProject(id: string): Project | null

// Get projects by user ID
getProjectsByUserId(userId: string): Project[]

// Create project
createProject(projectData): Project

// Update project
updateProject(projectId: string, updates): Project | null

// Delete project (also removes associated tasks)
deleteProject(projectId: string): boolean
```

### Task Operations

```typescript
// Get all tasks
getAllTasks(): Task[]

// Get task by ID
getTask(id: string): Task | null

// Get tasks by multiple IDs
getTasksByIds(ids: string[]): Task[]

// Get tasks in a project
getTasksInProject(projectId: string): Task[]

// Get tasks assigned to a user
getTasksByAssignee(userId: string): Task[]

// Create task
createTask(taskData): Task

// Update task
updateTaskById(taskId: string, updates): Task | null

// Update task status
updateTaskStatus(taskId: string, status: string): Task | null

// Update task dependencies
updateTaskDependencies(taskId: string, dependsOn: string[]): Task | null

// Delete task
deleteTask(taskId: string): boolean
```

### Batch Operations

```typescript
// Get dashboard statistics for a user
getDashboardStats(userId: string): {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
}

// Get recent projects
getRecentProjects(userId: string, limit?: number): Project[]

// Get recent tasks
getRecentTasks(userId: string, limit?: number): Task[]
```

### Utility Operations

```typescript
// Reset all data to initial state (testing purposes)
resetData(): void
```

## Usage Example

### In Components

```typescript
'use client'

import { getUsers, getAllProjects, createProject } from '@/lib/data'

export default function MyComponent() {
  // Get all users
  const users = getUsers()
  
  // Get all projects with their tasks
  const projects = getAllProjects()
  
  // Create a new project
  const handleCreateProject = (formData) => {
    createProject({
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      budget: formData.budget,
      userId: "mock-user",
      teamMembers: selectedMembers
    })
  }
}
```

## Transition to Database

When transitioning to a database:

1. **Keep the API the same** - The exported functions should maintain the same signatures
2. **Replace implementation** - Update functions to make database queries instead of array operations
3. **No component changes needed** - Components continue to work with the same API

### Example Migration Path

```typescript
// Before (mock data)
export const getProject = (id: string) => {
  const project = projects.find(p => p.id === id)
  // ... return with tasks
}

// After (Prisma/Database)
export const getProject = async (id: string) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: true }
  })
  return project
}
```

## Best Practices

1. **Always use the data layer** - Don't import mock data directly in components
2. **Use consistent patterns** - Create/Update/Delete operations follow the same pattern
3. **Keep mock data centralized** - Update `mock-data.ts` when adding new entities
4. **Type safety** - Use TypeScript interfaces for all data types
5. **Error handling** - Functions return `null` for not found cases, making null-safe patterns easier

## Current Data Schema

### User
```typescript
{
  id: string
  name: string
  email: string
  avatar: string
}
```

### Project
```typescript
{
  id: string
  name: string
  description: string
  status: "ACTIVE" | "PLANNING" | "ON_HOLD" | "COMPLETED"
  startDate: Date
  endDate: Date
  budget: number
  userId: string
  teamMembers: string[]
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
  _count?: { tasks: number }
}
```

### Task
```typescript
{
  id: string
  title: string
  description: string
  status: "TO DO" | "IN_PROGRESS" | "COMPLETED"
  priority: "LOW" | "MEDIUM" | "HIGH"
  startDate: Date
  dueDate: Date
  projectId: string
  assignedTo: string | null
  dependsOn: string[]
  createdAt: Date
  updatedAt: Date
}
```

## Future Enhancements

- Add pagination for large data sets
- Add filtering and sorting utilities
- Add data validation layer
- Add caching for frequently accessed data
- Add audit logging for data changes
- Add transaction support for complex operations
