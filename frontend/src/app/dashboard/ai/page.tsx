'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  User, 
  BarChart3,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Target,
  Clock
} from 'lucide-react';
import { aiService, type AIAnalytics, type AIHealthStatus } from '@/services/aiService';
import { ObjectionHandler } from '@/components/ai';

export default function AIDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AIDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AIDashboardContent() {
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);
  const [healthStatus, setHealthStatus] = useState<AIHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '30d'>('7d');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [analyticsResponse, healthResponse] = await Promise.all([
        aiService.getAnalytics(selectedPeriod),
        aiService.getHealthStatus()
      ]);
      
      setAnalytics(analyticsResponse);
      setHealthStatus(healthResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI dashboard data');
      console.error('AI Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'degraded':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'down':
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800';
    }
  };

  // Safe calculation for average response time
  const calculateAvgResponseTime = () => {
    if (!analytics?.avgResponseTime) return 0;
    return Math.round(analytics.avgResponseTime);
  };

  // Safe calculation for positive feedback percentage
  const calculatePositiveFeedbackPercentage = () => {
    if (!analytics?.positiveFeedback) return 0;
    return analytics.positiveFeedback;
  };

  // Calculate remaining requests based on the actual daily limit (500)
  const calculateRemainingRequests = () => {
    if (!analytics?.todaysUsage) return 500;
    return Math.max(0, 500 - analytics.todaysUsage);
  };

  const aiFeatures = [
    {
      name: 'Deal Coach',
      description: 'AI-powered coaching suggestions for deals',
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      path: '/dashboard/deals'
    },
    {
      name: 'Customer Persona',
      description: 'Generate customer personality insights',
      icon: User,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      path: '/contacts'
    },
    {
      name: 'Objection Handler',
      description: 'AI responses to customer objections',
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      path: '#objection-handler'
    },
    {
      name: 'Win/Loss Explainer',
      description: 'Analyze why deals were won or lost',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      path: '/dashboard/deals'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            AI Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor and manage your AI-powered CRM features
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '1d' | '7d' | '30d')}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="glass-card">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Error loading AI dashboard</span>
          </div>
          <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && analytics && healthStatus && (
        <>
          {/* AI Health Status */}
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-h3">AI Services Health</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Status */}
              <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                {healthStatus.healthy ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Overall Status</p>
                  <Badge className={getHealthStatusColor(healthStatus.status)}>
                    {healthStatus.status}
                  </Badge>
                </div>
              </div>

              {/* OpenAI Status */}
              <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">OpenAI</p>
                  <Badge className={getHealthStatusColor(healthStatus.openai.status)}>
                    {healthStatus.openai.status}
                  </Badge>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Model: {healthStatus.openai.model}
                  </p>
                </div>
              </div>

              {/* Vector Database */}
              <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Vector DB</p>
                  <Badge className={getHealthStatusColor(healthStatus.vectorDatabase.status)}>
                    {healthStatus.vectorDatabase.status}
                  </Badge>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Collections: {Object.keys(healthStatus.vectorDatabase.collections || {}).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-label text-slate-600 dark:text-slate-400">Total Requests</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {(analytics.totalRequests || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedPeriod === '1d' ? 'Last 24 hours' : selectedPeriod === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-label text-slate-600 dark:text-slate-400">Today's Usage</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {(analytics?.todaysUsage || 0).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {calculateRemainingRequests()} remaining
              </p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-label text-slate-600 dark:text-slate-400">Positive Feedback</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {calculatePositiveFeedbackPercentage()}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                User satisfaction
              </p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-label text-slate-600 dark:text-slate-400">Avg Response Time</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {calculateAvgResponseTime()}ms
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Across all features
              </p>
            </div>
          </div>

          {/* Feature Usage Breakdown */}
          {analytics?.featureUsage && Object.keys(analytics.featureUsage).length > 0 && (
            <div className="glass-card">
              <h3 className="text-h3 mb-4">Feature Usage Breakdown</h3>
              
              <div className="space-y-4">
                {Object.entries(analytics.featureUsage).map(([feature, count]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {count} requests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {Math.round((count / (analytics.totalRequests || 1)) * 100)}%
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">of total</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Features Overview */}
          <div className="glass-card">
            <h3 className="text-h3 mb-4">Available AI Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiFeatures.map((feature) => (
                <div key={feature.name} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100">{feature.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {feature.description}
                      </p>
                      {feature.path !== '#objection-handler' && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={feature.path}>Try it out</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Objection Handler */}
          <div id="objection-handler">
            <ObjectionHandler className="glass-card" />
          </div>
        </>
      )}
    </div>
  );
} 