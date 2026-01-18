'use client'

import { useState } from 'react'
import Link from "next/link"
import { Check, Crown, Zap } from "lucide-react"

const SUBSCRIPTION_PLANS = {
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
    }
}

export default function PricingClient() {
    const [loading, setLoading] = useState<string | null>(null)

    const handleGetStarted = async (plan: 'PRO' | 'ENTERPRISE') => {
        setLoading(plan)

        try {
            const planConfig = SUBSCRIPTION_PLANS[plan]

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: planConfig.priceId,
                    plan: plan
                }),
            })

            const { url, error } = await response.json()

            if (error) {
                console.error('Checkout error:', error)
                alert('Please sign in first to start your subscription')
                return
            }

            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error('Subscription error:', error)
            alert('Please sign in first to start your subscription')
        } finally {
            setLoading(null)
        }
    }

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'FREE':
                return <Check className="w-8 h-8" />
            case 'PRO':
                return <Zap className="w-8 h-8" />
            case 'ENTERPRISE':
                return <Crown className="w-8 h-8" />
        }
    }

    return (
        <>
            {/* Success/Cancel Messages */}
            <div className="mb-8">
                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <Check className="w-5 h-5 text-green-600 mr-3" />
                            <span className="text-green-800">Welcome to TaskFlow Pro! Your subscription is now active.</span>
                        </div>
                    </div>
                )}

                {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('canceled') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="text-yellow-800">Subscription cancelled. You can try again anytime!</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 lg:grid-cols-3">
                {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
                    const isPopular = planKey === 'PRO'

                    return (
                        <div
                            key={planKey}
                            className={`relative bg-white rounded-2xl shadow-lg ${isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
                                }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-center justify-center mb-6">
                                    <div className={`p-3 rounded-lg ${planKey === 'FREE' ? 'bg-gray-100 text-gray-600' :
                                            planKey === 'PRO' ? 'bg-blue-100 text-blue-600' :
                                                'bg-purple-100 text-purple-600'
                                        }`}>
                                        {getPlanIcon(planKey)}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                                    {plan.name}
                                </h3>

                                <div className="text-center mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ${plan.price}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-gray-500">/month</span>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center">
                                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="text-center">
                                    {planKey === 'FREE' ? (
                                        <Link href="/auth/signup"
                                            className="w-full inline-block bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                                            Get Started Free
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleGetStarted(planKey as 'PRO' | 'ENTERPRISE')}
                                            disabled={loading === planKey}
                                            className={`w-full font-medium px-6 py-3 rounded-lg transition-colors ${isPopular
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                                } ${loading === planKey ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {loading === planKey ? 'Processing...' : `Start ${plan.name} Trial`}
                                        </button>
                                    )}
                                </div>

                                {planKey !== 'FREE' && (
                                    <p className="text-center text-sm text-gray-500 mt-3">
                                        14-day free trial, then ${plan.price}/month
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}