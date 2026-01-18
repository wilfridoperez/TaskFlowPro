import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
})

// Client-side Stripe instance
export const getStripe = () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable')
    }
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        priceId: null,
        features: [
            'Up to 3 projects',
            'Basic task management',
            'Email support',
            '5GB storage',
        ],
        limits: {
            projects: 3,
            tasksPerProject: 50,
            teamMembers: 5,
            storage: 5 * 1024 * 1024 * 1024, // 5GB in bytes
        }
    },
    PRO: {
        name: 'Pro',
        price: 29,
        priceId: 'price_1234567890abcdef', // Replace with actual Stripe price ID
        features: [
            'Unlimited projects',
            'Advanced task management',
            'Priority support',
            '100GB storage',
            'Team collaboration',
            'Time tracking',
            'Custom fields',
        ],
        limits: {
            projects: -1, // unlimited
            tasksPerProject: -1,
            teamMembers: 50,
            storage: 100 * 1024 * 1024 * 1024, // 100GB in bytes
        }
    },
    ENTERPRISE: {
        name: 'Enterprise',
        price: 99,
        priceId: 'price_0987654321fedcba', // Replace with actual Stripe price ID
        features: [
            'Everything in Pro',
            'Advanced analytics',
            'Custom integrations',
            'Dedicated support',
            '1TB storage',
            'SSO integration',
            'Advanced security',
            'API access',
        ],
        limits: {
            projects: -1,
            tasksPerProject: -1,
            teamMembers: -1,
            storage: 1024 * 1024 * 1024 * 1024, // 1TB in bytes
        }
    }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS