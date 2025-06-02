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
  Lightbulb
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
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-h3">AI Deal Coach</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSuggestions}
          disabled={loading}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
        </div>
      )}

      {suggestions && !loading && !error && (
        <>
          {/* Confidence Score */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Confidence</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
              {typeof suggestions.confidence === 'number' ? suggestions.confidence : 85}%
            </Badge>
          </div>

          {/* Suggestions */}
          <div className="space-y-3 mb-4">
            <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Recommended Actions
            </h4>
            
            {suggestions.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getPriorityIcon(suggestion.priority)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {suggestion.timeline}
                      </span>
                    </div>
                    
                    <h5 className="font-medium text-sm text-slate-900 dark:text-slate-100 leading-tight">
                      {suggestion.action}
                    </h5>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RAG Context Info */}
          {suggestions.ragContext && suggestions.ragContext.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Based on {suggestions.ragContext.length} similar deals
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                AI analyzed similar deals in your industry to provide these recommendations.
              </p>
            </div>
          )}

          {/* Feedback */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-400">Was this helpful?</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('positive')}
                className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('negative')}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 