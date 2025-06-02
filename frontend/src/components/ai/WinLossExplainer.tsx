'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { 
  TrendingUp, 
  TrendingDown,
  RefreshCw, 
  Brain,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Target,
  Lightbulb
} from 'lucide-react';
import { aiService, WinLossExplainerResponse } from '@/services/aiService';

interface WinLossExplainerProps {
  dealId: string;
  dealOutcome: 'closed_won' | 'closed_lost';
  dealValue: number;
  className?: string;
}

export function WinLossExplainer({ dealId, dealOutcome, dealValue, className }: WinLossExplainerProps) {
  const [analysis, setAnalysis] = useState<WinLossExplainerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalysis = async () => {
    if (!dealId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiService.explainWinLoss(dealId);
      setAnalysis(response);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to analyze deal outcome');
      console.error('Win/Loss Explainer error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [dealId]);

  const getOutcomeIcon = (outcome: string) => {
    return outcome === 'won' ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getOutcomeColor = (outcome: string) => {
    return outcome === 'won'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleFeedback = async (rating: 'thumbs_up' | 'thumbs_down') => {
    if (!analysis) return;
    
    try {
      console.log(`Feedback submitted: ${rating}`);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {dealOutcome === 'closed_won' ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
          Win/Loss Analysis
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAnalysis}
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

        {analysis && !loading && !error && (
          <>
            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">AI Confidence</span>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                {Math.round(analysis.confidence * 100)}%
              </Badge>
            </div>

            {/* Outcome Summary */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {getOutcomeIcon(analysis.analysis.outcome)}
                <div>
                  <Badge 
                    variant="outline" 
                    className={getOutcomeColor(analysis.analysis.outcome)}
                  >
                    Deal {analysis.analysis.outcome.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Timeline: {analysis.analysis.timeline}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Factors */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Primary Factors
              </h4>
              <div className="space-y-2">
                {analysis.analysis.primaryFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm leading-relaxed">{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Objection Handling */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Objection Handling
              </h4>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-800 leading-relaxed">
                    {analysis.analysis.objectionHandling}
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Level */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Customer Engagement
              </h4>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {analysis.analysis.engagementLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Lessons */}
            {analysis.analysis.keyLessons && analysis.analysis.keyLessons.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Key Lessons
                </h4>
                <div className="space-y-2">
                  {analysis.analysis.keyLessons.map((lesson, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                      <Brain className="h-3 w-3 text-purple-600 mt-0.5" />
                      <span className="text-sm text-purple-800">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Recommendations for Future Deals
                </h4>
                <div className="space-y-2">
                  {analysis.analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <Lightbulb className="h-3 w-3 text-green-600 mt-0.5" />
                      <span className="text-sm text-green-800">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAG Context Info */}
            {analysis.ragContext && analysis.ragContext.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Based on {analysis.ragContext.length} similar deals
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  AI analyzed similar deals with comparable outcomes and characteristics.
                </p>
              </div>
            )}

            {/* Feedback */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                Was this analysis helpful?
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

        {!analysis && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click refresh to analyze deal outcome</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 