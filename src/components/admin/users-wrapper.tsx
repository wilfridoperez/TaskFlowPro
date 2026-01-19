'use client'

import UsersManagementClient from '@/components/admin/users-management-client'

interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
}

interface UsersWrapperProps {
    initialUsers: User[]
}

export default function UsersWrapper({ initialUsers }: UsersWrapperProps) {
    return <UsersManagementClient initialUsers={initialUsers} />
}
