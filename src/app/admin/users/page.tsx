import { getUsers } from '@/lib/data'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersWrapper from './users-wrapper'

export default async function UsersPage() {
    const session = await auth()

    if (!session) {
        redirect('/auth/signin')
    }

    const usersData = await getUsers()

    // Map database users to UI format
    const users = usersData.map(user => ({
        id: user.id,
        name: user.name || 'User',
        email: user.email,
        avatar: user.avatar || '',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString().split('T')[0],
    }))

    return <UsersWrapper initialUsers={users} />
}
