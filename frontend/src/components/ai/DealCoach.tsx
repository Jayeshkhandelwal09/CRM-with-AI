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
  Target
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
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
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

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-h3">AI Deal Coach</h3>
            {lastUpdated && (
              <p className="text-caption text-slate-500 dark:text-slate-400">
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
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-label font-medium text-red-800 dark:text-red-300">Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      {suggestions && !loading && !error && (
        <div className="space-y-6">
          {/* AI Confidence */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-label text-slate-700 dark:text-slate-300">AI Confidence</span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                {typeof suggestions.confidence === 'number' ? suggestions.confidence : 80}%
              </Badge>
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
              Recommended Actions
            </h4>
            
            <div className="space-y-4">
              {suggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {getPriorityIcon(suggestion.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`border text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                        <span className="text-caption text-slate-500 dark:text-slate-400">
                          {suggestion.timeline}
                        </span>
                      </div>
                      
                      <h5 className="text-label font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {suggestion.action}
                      </h5>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RAG Context */}
          {suggestions.ragContext && suggestions.ragContext.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-label font-medium text-blue-800 dark:text-blue-300">
                  Based on {suggestions.ragContext.length} similar deals
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                AI analyzed similar deals in your industry to provide these recommendations.
              </p>
            </div>
          )}

          {/* Feedback */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <span className="text-label text-slate-600 dark:text-slate-400">Was this analysis helpful?</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('positive')}
                className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 h-8 w-8 p-0"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('negative')}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 h-8 w-8 p-0"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!suggestions && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-label font-medium text-slate-800 dark:text-slate-100 mb-2">
            No Analysis Available
          </h4>
          <p className="text-caption text-slate-600 dark:text-slate-400">
            Click refresh to generate AI coaching suggestions
          </p>
        </div>
      )}
    </div>
  );
} 