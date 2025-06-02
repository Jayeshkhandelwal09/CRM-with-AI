'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { 
  Brain, 
  RefreshCw, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  Zap,
  ArrowRight,
  Star,
  Activity
} from 'lucide-react';
import { aiService, DealCoachResponse, DealCoachSuggestion } from '@/services/aiService';

interface DealCoachProps {
  dealId: string;
  dealStage: string;
  dealValue: number;
  className?: string;
}

export function DealCoach({ dealId, dealStage, dealValue, className }: DealCoachProps) {
  const [suggestions, setSuggestions] = useState<DealCoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSuggestions = async () => {
    if (!dealId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiService.getDealCoach(dealId);
      setSuggestions(response);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to get AI suggestions');
      console.error('Deal Coach error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [dealId]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-500 to-red-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-green-500 to-green-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const handleFeedback = async (feedback: 'positive' | 'negative') => {
    if (!suggestions) return;
    
    try {
      await aiService.submitFeedback({
        feature: 'deal_coach',
        feedback,
        responseId: dealId
      });
      console.log(`Feedback submitted: ${feedback}`);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const confidenceLevel = typeof suggestions?.confidence === 'number' ? suggestions.confidence : 80;

  return (
    <div className={`glass-card ${className}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <Activity className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-h2 font-semibold text-slate-900 dark:text-slate-100">AI Deal Coach</h3>
            {lastUpdated && (
              <p className="text-caption text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
          className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg h-10 w-10 p-0"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Enhanced Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-label font-semibold text-red-800 dark:text-red-300">Analysis Failed</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Content */}
      {suggestions && !loading && !error && (
        <div className="space-y-8">
          {/* Enhanced AI Confidence */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-label font-medium text-blue-900 dark:text-blue-100">AI Confidence Score</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 px-3 py-1 text-sm font-semibold">
                {confidenceLevel}%
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${confidenceLevel}%` }}
              />
            </div>
            
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Based on deal data analysis and similar successful outcomes
            </p>
          </div>

          {/* Enhanced Recommended Actions */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                Recommended Actions
              </h4>
            </div>
            
            <div className="space-y-5">
              {suggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="group bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg dark:hover:shadow-slate-900/20 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Priority Icon with Gradient Background */}
                    {/* <div className={`w-12 h-12 bg-gradient-to-br ${getPriorityGradient(suggestion.priority)} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                      {getPriorityIcon(suggestion.priority)}
                    </div> */}
                    
                    <div className="flex-1 min-w-0">
                      {/* Header with Priority and Timeline */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`border text-xs px-3 py-1 rounded-full font-semibold ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-medium">{suggestion.timeline}</span>
                        </div>
                      </div>
                      
                      {/* Action Title */}
                      <h5 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {suggestion.action}
                      </h5>
                      
                      {/* Reasoning */}
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {suggestion.reasoning}
                      </p>
                      
                      {/* Action Arrow */}
                      <div className="flex items-center text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-xs font-medium mr-1">Take Action</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced RAG Context */}
          {suggestions.ragContext && suggestions.ragContext.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-label font-semibold text-emerald-900 dark:text-emerald-100">
                  Data-Driven Insights
                </span>
              </div>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                These recommendations are based on analysis of <strong>{suggestions.ragContext.length} similar deals</strong> in your industry with comparable characteristics and successful outcomes.
              </p>
            </div>
          )}

          {/* Enhanced Feedback Section */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            <span className="text-label font-medium text-slate-700 dark:text-slate-300">How helpful was this analysis?</span>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('positive')}
                className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('negative')}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!suggestions && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Ready to Analyze Your Deal
          </h4>
          <p className="text-body text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Click the refresh button to generate AI-powered coaching suggestions for this deal
          </p>
          <Button
            onClick={fetchSuggestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Generate Analysis
          </Button>
        </div>
      )}
    </div>
  );
} 