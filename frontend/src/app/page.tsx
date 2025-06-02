"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { SunIcon, MoonIcon, ChevronRightIcon, PlayIcon, CheckIcon, StarIcon, ArrowRightIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, ChartBarIcon, UsersIcon, CogIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Sales Director at TechCorp",
      content: "CRM AI transformed our sales process. We've seen a 40% increase in deal closure rates.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "VP Sales at Growth Inc",
      content: "The AI insights are game-changing. Our team is more productive than ever before.",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Sales Manager at Revenue Co",
      content: "Best CRM investment we've made. The automation saves us hours every day.",
      avatar: "ER"
    }
  ];

  const features = [
    {
      icon: UsersIcon,
      title: "Smart Contact Management",
      description: "AI-powered contact organization with automated data enrichment and smart categorization.",
      gradient: "from-blue-500 to-cyan-500",
      delay: "0ms"
    },
    {
      icon: ChartBarIcon,
      title: "Visual Deal Pipeline",
      description: "Intuitive drag-and-drop pipeline with predictive analytics and forecasting.",
      gradient: "from-emerald-500 to-teal-500",
      delay: "100ms"
    },
    {
      icon: SparklesIcon,
      title: "AI-Powered Insights",
      description: "Get intelligent recommendations, deal coaching, and customer persona analysis.",
      gradient: "from-purple-500 to-pink-500",
      delay: "200ms"
    },
    {
      icon: BoltIcon,
      title: "Automation Engine",
      description: "Automate follow-ups, lead scoring, and routine tasks to focus on selling.",
      gradient: "from-orange-500 to-red-500",
      delay: "300ms"
    },
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 compliance and advanced data protection.",
      gradient: "from-indigo-500 to-blue-500",
      delay: "400ms"
    },
    {
      icon: CogIcon,
      title: "Custom Integrations",
      description: "Seamlessly connect with your existing tools and workflows.",
      gradient: "from-slate-500 to-gray-500",
      delay: "500ms"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 container-responsive py-6">
        <div className="glass-card !p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-h2 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CRM AI</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle - Hidden */}
              <button
                onClick={toggleTheme}
                className="hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
              <Link href="/auth/register" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-lg group-hover:animate-pulse transition-all duration-700"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container-responsive py-20">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 glass-card !p-3 mb-8 group hover:scale-105 transition-transform duration-300">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <SparklesIcon className="w-4 h-4 text-blue-500" />
            <span className="text-label font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered CRM Platform
            </span>
            <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Transform Your
            </span>
            <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Sales Process
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Streamline customer relationships, accelerate deal closures, and unlock powerful insights 
            with our <span className="font-semibold text-blue-600 dark:text-blue-400">AI-powered CRM</span> designed for modern sales teams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/auth/register" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center">
              <span className="relative z-10 flex items-center justify-center ">
                Start Free Trial
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-lg group-hover:animate-pulse transition-all duration-700"></div>
            </Link>
            <button className="group glass-card !p-4 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-white ml-1" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="glass-card-light !p-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                <span className="font-medium">Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                <span className="font-medium">Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 container-responsive py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Everything You Need to Close More Deals
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Our comprehensive CRM platform combines powerful features with AI intelligence to supercharge your sales process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group glass-card hover:scale-105 transition-all duration-500 hover:shadow-2xl"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-h3 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-body text-slate-600 dark:text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 py-20">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Trusted by Sales Teams Worldwide
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Join thousands of sales professionals who have transformed their results with CRM AI
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-card !p-12 text-center">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl font-medium text-slate-800 dark:text-slate-200 mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container-responsive py-20">
        <div className="glass-card !p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                10K+
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">Active Users</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                $2.5M+
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">Deals Closed</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                40%
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">Increase in Sales</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                99.9%
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container-responsive">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-20 text-center">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Sales Process?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of sales teams who have already boosted their revenue with CRM AI. 
                Start your free trial today and see the difference AI can make.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/register" className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <span className="relative z-10 flex items-center justify-center">
                    Start Free Trial
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-500"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-lg group-hover:animate-pulse transition-all duration-700"></div>
                </Link>
                <Link href="/auth/login" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 dark:bg-slate-950 py-12">
        <div className="container-responsive text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-h3 font-bold text-white">CRM AI</span>
          </div>
          <p className="text-slate-400 mb-6">
            Transforming sales processes with AI-powered intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-slate-500 text-sm">
            © 2024 CRM AI. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
