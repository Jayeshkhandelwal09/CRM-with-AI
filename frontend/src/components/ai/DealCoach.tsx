'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleFeedback = async (rating: 'thumbs_up' | 'thumbs_down') => {
    if (!suggestions) return;
    
    try {
      // Note: We'd need the aiLogId from the response to submit feedback
      // For now, we'll just show a success message
      console.log(`Feedback submitted: ${rating}`);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Deal Coach
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {suggestions && !loading && !error && (
          <>
            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">AI Confidence</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                {Math.round(suggestions.confidence * 100)}%
              </Badge>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Recommended Actions
              </h4>
              
              {suggestions.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(suggestion.priority)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(suggestion.priority)}
                        >
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {suggestion.timeline}
                        </span>
                      </div>
                      
                      <h5 className="font-medium text-sm leading-tight">
                        {suggestion.action}
                      </h5>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RAG Context Info */}
            {suggestions.ragContext && suggestions.ragContext.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Based on {suggestions.ragContext.length} similar deals
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  AI analyzed similar deals in your industry to provide these recommendations.
                </p>
              </div>
            )}

            {/* Feedback */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Was this helpful?
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('thumbs_up')}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('thumbs_down')}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}

        {!suggestions && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click refresh to get AI suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 