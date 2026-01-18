const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seed() {
    console.log('🌱 Starting database seed...')

    try {
        // Hash password for test user
        const hashedPassword = await bcrypt.hash('TestPassword123', 10)

        // Create test user
        const user = await prisma.user.upsert({
            where: { email: 'test@test.com' },
            update: { password: hashedPassword },
            create: {
                id: 'cmjumwv2d00001ejv52lmcypd',
                name: 'Test User',
                email: 'test@test.com',
                password: hashedPassword,
                image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
            },
        })
        console.log('✓ Created test user:', user.email)

        // Create sample projects
        const project1 = await prisma.project.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'Website Redesign',
                description: 'Complete redesign of company website',
                status: 'ACTIVE',
                startDate: new Date('2025-12-01'),
                endDate: new Date('2026-03-01'),
                budget: 50000,
                ownerId: user.id,
                teamMemberIds: '',
            },
        })
        console.log('✓ Created project:', project1.name)

        const project2 = await prisma.project.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: 'Mobile App Dev',
                description: 'Native mobile application development',
                status: 'ACTIVE',
                startDate: new Date('2026-01-01'),
                endDate: new Date('2026-06-01'),
                budget: 80000,
                ownerId: user.id,
                teamMemberIds: '',
            },
        })
        console.log('✓ Created project:', project2.name)

        // Create sample tasks
        const task1 = await prisma.task.upsert({
            where: { id: 'task-1' },
            update: {},
            create: {
                id: 'task-1',
                title: 'Design mockups',
                description: 'Create high-fidelity mockups for desktop and mobile',
                status: 'DONE',
                priority: 'HIGH',
                startDate: new Date('2025-12-01'),
                dueDate: new Date('2025-12-15'),
                projectId: project1.id,
                assigneeId: null,
                dependsOn: '',
            },
        })
        console.log('✓ Created task:', task1.title)

        const task2 = await prisma.task.upsert({
            where: { id: 'task-2' },
            update: {},
            create: {
                id: 'task-2',
                title: 'Frontend development',
                description: 'Build responsive frontend using React',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                startDate: new Date('2025-12-16'),
                dueDate: new Date('2026-01-31'),
                projectId: project1.id,
                assigneeId: null,
                dependsOn: 'task-1',
            },
        })
        console.log('✓ Created task:', task2.title)

        const task3 = await prisma.task.upsert({
            where: { id: 'task-3' },
            update: {},
            create: {
                id: 'task-3',
                title: 'Backend API development',
                description: 'Create RESTful APIs for the application',
                status: 'TODO',
                priority: 'HIGH',
                startDate: new Date('2026-01-01'),
                dueDate: new Date('2026-02-15'),
                projectId: project1.id,
                assigneeId: null,
                dependsOn: '',
            },
        })
        console.log('✓ Created task:', task3.title)

        console.log('✅ Database seeded successfully!')
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

seed()
