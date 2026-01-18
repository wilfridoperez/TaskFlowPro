'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Check, Zap } from 'lucide-react'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'

interface SubscriptionManagerProps {
    currentPlan: SubscriptionPlan
    userEmail: string
}

export default function SubscriptionManager({ currentPlan, userEmail }: SubscriptionManagerProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handleUpgrade = async (plan: SubscriptionPlan) => {
        if (plan === 'FREE' || plan === currentPlan) return

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
                alert('Failed to create checkout session')
                return
            }

            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error('Upgrade error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    const getPlanIcon = (plan: SubscriptionPlan) => {
        switch (plan) {
            case 'FREE':
                return <Check className="w-6 h-6" />
            case 'PRO':
                return <Zap className="w-6 h-6" />
            case 'ENTERPRISE':
                return <Crown className="w-6 h-6" />
        }
    }

    const getPlanColor = (plan: SubscriptionPlan) => {
        switch (plan) {
            case 'FREE':
                return 'text-gray-600 bg-gray-50 border-gray-200'
            case 'PRO':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'ENTERPRISE':
                return 'text-purple-600 bg-purple-50 border-purple-200'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
                    <p className="text-gray-600">Manage your TaskFlow Pro subscription</p>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPlanColor(currentPlan)}`}>
                    {getPlanIcon(currentPlan)}
                    <span className="ml-2">{SUBSCRIPTION_PLANS[currentPlan].name}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => {
                    const planName = planKey as SubscriptionPlan
                    const isCurrentPlan = planName === currentPlan
                    const isUpgrade = planName !== 'FREE' && planName !== currentPlan

                    return (
                        <div
                            key={planName}
                            className={`border rounded-lg p-4 ${isCurrentPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    {getPlanIcon(planName)}
                                    <h3 className="ml-2 font-semibold text-gray-900">{plan.name}</h3>
                                </div>
                                {planName === 'PRO' && (
                                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                                        Popular
                                    </span>
                                )}
                            </div>

                            <div className="mb-3">
                                <span className="text-2xl font-bold text-gray-900">
                                    ${plan.price}
                                </span>
                                {plan.price > 0 && (
                                    <span className="text-gray-600">/month</span>
                                )}
                            </div>

                            <ul className="space-y-2 mb-4 text-sm text-gray-600">
                                {plan.features.slice(0, 4).map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <Check className="w-4 h-4 text-green-500 mr-2" />
                                        {feature}
                                    </li>
                                ))}
                                {plan.features.length > 4 && (
                                    <li className="text-gray-500 italic">
                                        +{plan.features.length - 4} more features
                                    </li>
                                )}
                            </ul>

                            {isCurrentPlan ? (
                                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-2 rounded text-center">
                                    Current Plan
                                </div>
                            ) : isUpgrade ? (
                                <button
                                    onClick={() => handleUpgrade(planName)}
                                    disabled={loading === planName}
                                    className={`w-full bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors ${loading === planName ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {loading === planName ? 'Processing...' : 'Upgrade'}
                                </button>
                            ) : (
                                <div className="text-gray-500 text-sm text-center py-2">
                                    Contact for downgrade
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Current Usage</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Projects:</span>
                        <span className="ml-2 font-medium">3 of {SUBSCRIPTION_PLANS[currentPlan].limits.projects === -1 ? '∞' : SUBSCRIPTION_PLANS[currentPlan].limits.projects}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Storage:</span>
                        <span className="ml-2 font-medium">2.1GB of {Math.round(SUBSCRIPTION_PLANS[currentPlan].limits.storage / (1024 * 1024 * 1024))}GB</span>
                    </div>
                </div>
            </div>
        </div>
    )
}