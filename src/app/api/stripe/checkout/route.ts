import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { stripe, SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { priceId, plan } = await request.json()

        if (!priceId || !plan || !(plan in SUBSCRIPTION_PLANS)) {
            return NextResponse.json({ error: 'Invalid plan or price ID' }, { status: 400 })
        }

        // Get or create Stripe customer
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        let customerId = user.stripeCustomerId

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: session.user.name || undefined,
                metadata: {
                    userId: user.id
                }
            })

            customerId = customer.id

            // Update user with Stripe customer ID
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId }
            })
        }

        // Create Stripe checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true&plan=${plan}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
                plan: plan
            }
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 })
    }
}