"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    toast.info('Signing out...', {
      description: 'You have been successfully signed out.',
    });
    logout();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container-responsive py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-h3 font-semibold">CRM AI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-label font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-caption text-slate-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-h1 mb-2">Welcome to your CRM Dashboard</h1>
          <p className="text-body">
            You&apos;re successfully authenticated! This is a protected page that requires login.
          </p>
        </div>

        {/* Success Card */}
        <div className="glass-card mb-8">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-h3 mb-2">Authentication Complete!</h3>
              <p className="text-body mb-4">
                Your authentication system is working correctly. You can now access protected routes and your user data is available throughout the application.
              </p>
              <div className="space-y-2">
                <p className="text-label"><strong>User ID:</strong> {user?.id}</p>
                <p className="text-label"><strong>Email:</strong> {user?.email}</p>
                <p className="text-label"><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p className="text-label"><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass-card-light">
          <h3 className="text-h3 mb-4">Next Development Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Landing page with navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Login and registration pages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Form validation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Authentication context</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">JWT token storage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Protected route wrapper</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Sonner toast notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-success">✓</span>
              <span className="text-body">Password reset form</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-info">→</span>
              <span className="text-body">Ready for Phase 3: Core Data Models</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 