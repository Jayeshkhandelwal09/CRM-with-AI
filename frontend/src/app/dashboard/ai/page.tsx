'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        return 'text-green-600 bg-green-100 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'down':
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const aiFeatures = [
    {
      name: 'Deal Coach',
      description: 'AI-powered coaching suggestions for deals',
      icon: Brain,
      color: 'text-purple-600 bg-purple-100',
      path: '/dashboard/deals'
    },
    {
      name: 'Customer Persona',
      description: 'Generate customer personality insights',
      icon: User,
      color: 'text-blue-600 bg-blue-100',
      path: '/contacts'
    },
    {
      name: 'Objection Handler',
      description: 'AI responses to customer objections',
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-100',
      path: '#objection-handler'
    },
    {
      name: 'Win/Loss Explainer',
      description: 'Analyze why deals were won or lost',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      path: '/dashboard/deals'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your AI-powered CRM features
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '1d' | '7d' | '30d')}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error loading AI dashboard</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && analytics && healthStatus && (
        <>
          {/* AI Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Services Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Status */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {healthStatus.healthy ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">Overall Status</p>
                    <Badge className={getHealthStatusColor(healthStatus.status)}>
                      {healthStatus.status}
                    </Badge>
                  </div>
                </div>

                {/* OpenAI Status */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">OpenAI</p>
                    <Badge className={getHealthStatusColor(healthStatus.openai.status)}>
                      {healthStatus.openai.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Model: {healthStatus.openai.model}
                    </p>
                  </div>
                </div>

                {/* Vector Database */}
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Vector DB</p>
                    <Badge className={getHealthStatusColor(healthStatus.vectorDatabase.status)}>
                      {healthStatus.vectorDatabase.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Collections: {Object.keys(healthStatus.vectorDatabase.collections).length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-muted-foreground">Total Requests</span>
                </div>
                <div className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedPeriod === '1d' ? 'Last 24 hours' : selectedPeriod === '7d' ? 'Last 7 days' : 'Last 30 days'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-muted-foreground">Today's Usage</span>
                </div>
                <div className="text-2xl font-bold">{analytics.todayUsage.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.remainingRequests} remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-muted-foreground">Positive Feedback</span>
                </div>
                <div className="text-2xl font-bold">{analytics.feedbackStats.thumbsUp}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((analytics.feedbackStats.thumbsUp / (analytics.feedbackStats.thumbsUp + analytics.feedbackStats.thumbsDown)) * 100) || 0}% positive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-muted-foreground">Avg Response Time</span>
                </div>
                <div className="text-2xl font-bold">
                  {Object.values(analytics.requestsByFeature).length > 0 
                    ? Math.round(Object.values(analytics.requestsByFeature).reduce((acc, feature) => acc + feature.avgResponseTime, 0) / Object.values(analytics.requestsByFeature).length)
                    : 0}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all features
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.requestsByFeature).map(([feature, stats]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.count} requests • {Math.round(stats.successRate * 100)}% success rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{stats.avgResponseTime}ms</p>
                      <p className="text-sm text-muted-foreground">avg response</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Available AI Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiFeatures.map((feature) => (
                  <div key={feature.name} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${feature.color}`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
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
            </CardContent>
          </Card>

          {/* Interactive Objection Handler */}
          <div id="objection-handler">
            <ObjectionHandler className="glass-card" />
          </div>
        </>
      )}
    </div>
  );
} 