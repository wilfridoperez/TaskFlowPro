import Link from "next/link"
import PricingClient from "@/components/PricingClient"

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            TaskFlow Pro
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/auth/signin" className="text-gray-500 hover:text-gray-700">
                                Sign In
                            </Link>
                            <Link href="/auth/signup"
                                className="bg-blue-600 px-4 py-2 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 mb-12">
                        Start for free, then scale your team with powerful project management tools
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <PricingClient />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-white">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Can I change plans anytime?
                            </h3>
                            <p className="text-gray-600">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be charged or credited the prorated amount.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Is there a free trial?
                            </h3>
                            <p className="text-gray-600">
                                Yes! All paid plans come with a 14-day free trial. No credit card required for the free plan.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                What happens if I cancel?
                            </h3>
                            <p className="text-gray-600">
                                You can cancel anytime. You'll continue to have access to paid features until your current billing period ends, then you'll be moved to the free plan.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Do you offer refunds?
                            </h3>
                            <p className="text-gray-600">
                                We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund within 30 days of your purchase.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold">TaskFlow Pro</div>
                        <div className="text-gray-400">
                            © 2025 TaskFlow Pro. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}