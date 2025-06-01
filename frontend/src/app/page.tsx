"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Header */}
      <nav className="container-responsive py-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-h3 font-semibold text-slate-800 dark:text-slate-100">CRM AI</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              ) : (
                <SunIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              )}
            </button>
            <Link href="/auth/login" className="btn-ghost">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-responsive py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-label font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered CRM Platform
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transform Your Sales
            <br />
            with <span className="text-blue-500">AI Intelligence</span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Streamline your customer relationships, accelerate deal closures, and unlock powerful insights 
            with our AI-powered CRM designed for modern sales teams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-slate-500 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free 14-day trial
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Setup in 5 minutes
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Management */}
          <div className="glass-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-h3 mb-3">Smart Contact Management</h3>
            <p className="text-body mb-4 text-slate-600 dark:text-slate-300">
              Organize and track up to 2,000 contacts with AI-powered insights, smart categorization, and automated data enrichment.
            </p>
            <div className="flex items-center gap-2">
              <span className="status-info">2,000 contacts</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-caption text-slate-500 dark:text-slate-400">AI-enhanced</span>
            </div>
          </div>

          {/* Deal Pipeline */}
          <div className="glass-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-h3 mb-3">Visual Deal Pipeline</h3>
            <p className="text-body mb-4 text-slate-600 dark:text-slate-300">
              Track up to 5,000 deals through customizable pipeline stages with intuitive drag-and-drop functionality and forecasting.
            </p>
            <div className="flex items-center gap-2">
              <span className="status-success">5,000 deals</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-caption text-slate-500 dark:text-slate-400">Drag & drop</span>
            </div>
          </div>

          {/* AI Features */}
          <div className="ai-module-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-h3 mb-3">AI-Powered Insights</h3>
            <p className="text-body mb-4 text-slate-600 dark:text-slate-300">
              Get intelligent recommendations, deal coaching, customer persona insights, and predictive analytics powered by advanced AI.
            </p>
            <div className="flex items-center gap-2">
              <span className="status-warning">100 AI requests/day</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-caption text-slate-500 dark:text-slate-400">Smart insights</span>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="glass-card-light text-center">
          <h3 className="text-h3 mb-6">Trusted by Sales Teams Worldwide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-slate-500 dark:text-slate-400 font-semibold">TechCorp</div>
            <div className="text-slate-500 dark:text-slate-400 font-semibold">SalesForce Pro</div>
            <div className="text-slate-500 dark:text-slate-400 font-semibold">Growth Inc</div>
            <div className="text-slate-500 dark:text-slate-400 font-semibold">Revenue Co</div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="bg-white dark:bg-slate-800 py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-h1 mb-4">Everything You Need to Close More Deals</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our comprehensive CRM platform combines powerful features with AI intelligence to supercharge your sales process.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-h2 mb-6">Built for Modern Sales Teams</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-h3 mb-2">Intelligent Lead Scoring</h4>
                    <p className="text-body text-slate-600 dark:text-slate-300">AI analyzes your leads and prioritizes the most promising opportunities automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-h3 mb-2">Automated Follow-ups</h4>
                    <p className="text-body text-slate-600 dark:text-slate-300">Never miss a follow-up with smart reminders and automated email sequences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-h3 mb-2">Real-time Analytics</h4>
                    <p className="text-body text-slate-600 dark:text-slate-300">Track performance with detailed reports and actionable insights in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-label text-slate-600 dark:text-slate-300">Interactive Demo Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="container-responsive text-center">
          <h2 className="text-h1 text-white mb-4">Ready to Transform Your Sales Process?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of sales teams who have already boosted their revenue with CRM AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Start Your Free Trial
            </Link>
            <Link href="/auth/login" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
