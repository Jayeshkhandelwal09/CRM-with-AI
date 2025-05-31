import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-glass to-slate-900 p-4">
      {/* Header */}
      <header className="glass-nav rounded-lg p-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-ice-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🤖</span>
            </div>
            <h1 className="text-xl font-bold text-ice-blue">AI-Powered CRM</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-cool-grey hover:text-ice-blue transition-colors">Features</a>
            <a href="#about" className="text-cool-grey hover:text-ice-blue transition-colors">About</a>
            <a href="#contact" className="text-cool-grey hover:text-ice-blue transition-colors">Contact</a>
          </nav>
          <div className="flex space-x-3">
            <Link href="/login">
              <Button variant="outline" className="glass-secondary border-soft-purple text-soft-purple hover:bg-soft-purple hover:text-white">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="glass-button text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="glass-card p-12 mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-near-white">Next-Generation</span>
              <br />
              <span className="text-ice-blue">AI-Powered CRM</span>
            </h1>
            <p className="text-xl text-cool-grey mb-8 max-w-3xl mx-auto">
              Transform your sales process with intelligent AI modules that provide real-time coaching, 
              customer insights, objection handling, and deal analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="glass-button text-white px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="glass-secondary border-soft-purple text-soft-purple hover:bg-soft-purple hover:text-white px-8 py-3">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="glass-card border-glass">
            <CardHeader>
              <div className="w-12 h-12 bg-ice-blue/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <CardTitle className="text-ice-blue">Deal Coach AI</CardTitle>
              <CardDescription className="text-cool-grey">
                Get 2-3 actionable next steps for every deal based on AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-cool-grey space-y-2">
                <li>• Smart deal progression tracking</li>
                <li>• Idle deal notifications</li>
                <li>• Stage-specific recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass">
            <CardHeader>
              <div className="w-12 h-12 bg-soft-purple/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <CardTitle className="text-soft-purple">Persona Builder</CardTitle>
              <CardDescription className="text-cool-grey">
                Automatically generate behavioral profiles of your contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-cool-grey space-y-2">
                <li>• Communication style analysis</li>
                <li>• Decision-making patterns</li>
                <li>• Engagement level tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass">
            <CardHeader>
              <div className="w-12 h-12 bg-ice-blue/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <CardTitle className="text-ice-blue">Objection Handler</CardTitle>
              <CardDescription className="text-cool-grey">
                Get persuasive responses to common sales objections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-cool-grey space-y-2">
                <li>• Multiple response strategies</li>
                <li>• Tone matching to persona</li>
                <li>• Follow-up question suggestions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass">
            <CardHeader>
              <div className="w-12 h-12 bg-soft-purple/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-soft-purple">Win/Loss Explainer</CardTitle>
              <CardDescription className="text-cool-grey">
                Understand why deals succeed or fail with AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-cool-grey space-y-2">
                <li>• Timeline analysis</li>
                <li>• Objection impact assessment</li>
                <li>• Competitive factor review</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="glass-card p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-ice-blue mb-2">40%</div>
              <div className="text-cool-grey">Increase in Deal Closure Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-soft-purple mb-2">75%</div>
              <div className="text-cool-grey">Positive AI Feedback Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-ice-blue mb-2">3x</div>
              <div className="text-cool-grey">Faster Deal Progression</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div id="about" className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold text-near-white mb-4">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-cool-grey mb-8 max-w-2xl mx-auto">
            Join thousands of sales professionals who are already using AI to close more deals faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="glass-button text-white px-8 py-3">
                Start Your Free Trial Today
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="glass-secondary border-soft-purple text-soft-purple hover:bg-soft-purple hover:text-white px-8 py-3">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="contact" className="glass-nav rounded-lg p-6 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-cool-grey">
            © 2024 AI-Powered CRM. Built with Next.js, Express.js, and OpenAI.
          </p>
        </div>
      </footer>
    </div>
  );
}
