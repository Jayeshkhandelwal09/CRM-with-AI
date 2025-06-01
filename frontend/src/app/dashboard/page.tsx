'use client';

import React from 'react';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-near-white">Welcome back, {user?.firstName}!</h1>
          <p className="text-cool-grey mt-2">
            Ready to supercharge your sales with AI? Here's your overview.
          </p>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue">Profile Information</CardTitle>
              <CardDescription className="text-cool-grey">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-cool-grey">Name: </span>
                <span className="text-near-white">{user?.fullName}</span>
              </div>
              <div>
                <span className="text-cool-grey">Email: </span>
                <span className="text-near-white">{user?.email}</span>
              </div>
              <div>
                <span className="text-cool-grey">Role: </span>
                <span className="text-near-white">{user?.role}</span>
              </div>
              <div>
                <span className="text-cool-grey">Company: </span>
                <span className="text-near-white">{user?.company}</span>
              </div>
              {user?.department && (
                <div>
                  <span className="text-cool-grey">Department: </span>
                  <span className="text-near-white">{user.department}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue">AI Usage</CardTitle>
              <CardDescription className="text-cool-grey">
                Your daily AI request usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cool-grey">Requests Used</span>
                    <span className="text-near-white">
                      {user?.aiRequestsUsed} / {user?.aiRequestsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-charcoal-glass rounded-full h-2">
                    <div
                      className="bg-ice-blue h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((user?.aiRequestsUsed || 0) / (user?.aiRequestsLimit || 100)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-cool-grey">
                  Resets daily at midnight
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue">Account Status</CardTitle>
              <CardDescription className="text-cool-grey">
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-cool-grey">Status: </span>
                <span className={`${user?.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {user?.status?.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-cool-grey">Email Verified: </span>
                <span className={user?.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                  {user?.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-cool-grey">Onboarding: </span>
                <span className={user?.onboardingCompleted ? 'text-green-400' : 'text-yellow-400'}>
                  {user?.onboardingCompleted ? 'Complete' : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-cool-grey">Member Since: </span>
                <span className="text-near-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Modules Preview */}
        <div>
          <h2 className="text-2xl font-bold text-near-white mb-4">AI-Powered Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-glass hover:border-ice-blue transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Deal Coach AI</span>
                </CardTitle>
                <CardDescription className="text-cool-grey">
                  Get AI-powered insights to close deals faster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cool-grey">
                  Coming soon in Phase 4...
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass hover:border-ice-blue transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <span>👤</span>
                  <span>Persona Builder</span>
                </CardTitle>
                <CardDescription className="text-cool-grey">
                  Build detailed customer personas with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cool-grey">
                  Coming soon in Phase 4...
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass hover:border-ice-blue transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Objection Handler</span>
                </CardTitle>
                <CardDescription className="text-cool-grey">
                  Handle objections with AI-generated responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cool-grey">
                  Coming soon in Phase 4...
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass hover:border-ice-blue transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <span>📊</span>
                  <span>Win/Loss Explainer</span>
                </CardTitle>
                <CardDescription className="text-cool-grey">
                  Understand why deals succeed or fail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-cool-grey">
                  Coming soon in Phase 4...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-2xl font-bold text-near-white mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card border-glass">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-ice-blue">0</p>
                  <p className="text-cool-grey text-sm">Total Contacts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-glass">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-ice-blue">0</p>
                  <p className="text-cool-grey text-sm">Active Deals</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-glass">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-ice-blue">$0</p>
                  <p className="text-cool-grey text-sm">Pipeline Value</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-glass">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-ice-blue">0%</p>
                  <p className="text-cool-grey text-sm">Win Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default withAuth(DashboardPage); 