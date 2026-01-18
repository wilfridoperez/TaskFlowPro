import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
])

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        console.error('Webhook signature verification failed:', error)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (!relevantEvents.has(event.type)) {
        return NextResponse.json({ received: true })
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                if (session.mode === 'subscription') {
                    const userId = session.metadata?.userId
                    const plan = session.metadata?.plan

                    if (userId && plan) {
                        await prisma.user.update({
                            where: { id: userId },
                            data: {
                                subscription: plan as 'FREE' | 'PRO' | 'ENTERPRISE'
                            }
                        })
                        console.log(`User ${userId} upgraded to ${plan}`)
                    }
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                const user = await prisma.user.findUnique({
                    where: { stripeCustomerId: customerId }
                })

                if (user) {
                    // Determine plan based on subscription status and items
                    let newPlan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE'

                    if (subscription.status === 'active') {
                        // In a real implementation, you'd check the price ID to determine the plan
                        // For now, we'll keep the current subscription
                        newPlan = user.subscription
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: { subscription: newPlan }
                    })
                }
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                const user = await prisma.user.findUnique({
                    where: { stripeCustomerId: customerId }
                })

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { subscription: 'FREE' }
                    })
                    console.log(`User ${user.id} downgraded to FREE`)
                }
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                const customerId = invoice.customer as string

                console.log(`Payment succeeded for customer ${customerId}`)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                const customerId = invoice.customer as string

                console.log(`Payment failed for customer ${customerId}`)

                // Optionally handle failed payments (e.g., send email, downgrade plan)
                break
            }
        }
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json({
            error: 'Webhook handler failed'
        }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}