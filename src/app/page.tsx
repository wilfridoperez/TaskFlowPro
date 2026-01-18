import Link from "next/link"
import { CheckCircle, Users, BarChart3, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TaskFlow Pro</h1>
            </div>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Project Management <span className="text-blue-600">Reimagined</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            TaskFlow Pro combines intelligent automation with intuitive design to help remote teams
            collaborate more effectively and deliver projects faster.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/auth/signup"
              className="bg-blue-600 px-8 py-3 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg">
              Start Free Trial
            </Link>
            <Link href="/pricing"
              className="border border-gray-300 px-8 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to manage projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Task Management</h3>
              <p className="text-gray-600">AI-powered task prioritization and automation</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Real-time collaboration tools for remote teams</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">Insights and reports to track project progress</p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Automation</h3>
              <p className="text-gray-600">Automate repetitive tasks and workflows</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your project management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using TaskFlow Pro
          </p>
          <Link href="/auth/signup"
            className="bg-white px-8 py-3 text-blue-600 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">TaskFlow Pro</h3>
            <p className="text-gray-400">© 2025 TaskFlow Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}