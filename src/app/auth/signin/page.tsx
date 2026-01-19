"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate } from "@/lib/actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
            {pending ? "Signing in..." : "Sign in"}
        </button>
    )
}

export default function SignInPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to home
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <form action={dispatch} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="text-red-600 text-sm text-center">{errorMessage}</div>
                    )}

                    <div>
                        <SubmitButton />
                    </div>

                    <div className="text-center space-y-2">
                        <div>
                            <Link href="/auth/forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                                Forgot your password?
                            </Link>
                        </div>
                        <div>
                            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}