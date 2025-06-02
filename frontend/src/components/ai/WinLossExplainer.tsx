'use client';

import React, { useState, useEffect } from 'react';
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

const getOutcomeIcon = (outcome: string) => {
  switch (outcome) {
    case 'won':
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case 'lost':
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    default:
      return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
  }
};

const getOutcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'won':
      return 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'lost':
      return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    default:
      return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
  }
};

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
      setError(err.message || 'Failed to get win/loss analysis');
      console.error('Win/Loss Explainer error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [dealId, dealOutcome]);

  const handleFeedback = async (feedback: 'thumbs_up' | 'thumbs_down') => {
    if (!analysis) return;
    
    try {
      await aiService.submitFeedback({
        feature: 'win_loss_explainer',
        feedback: feedback === 'thumbs_up' ? 'positive' : 'negative',
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
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            dealOutcome === 'closed_won' 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            {dealOutcome === 'closed_won' ? (
              <TrendingUp className="w-5 h-5 text-white" />
            ) : (
              <TrendingDown className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-h3">Win/Loss Analysis</h3>
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
          onClick={fetchAnalysis}
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
            <Skeleton className="h-6 w-20" />
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
      {analysis && !loading && !error && (
        <div className="space-y-6">
          {/* AI Confidence */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-label text-slate-700 dark:text-slate-300">AI Confidence</span>
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700">
                {Math.round((analysis.confidence || 0.8) * 100)}%
              </Badge>
            </div>
          </div>

          {/* Outcome Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              {getOutcomeIcon(analysis.analysis?.outcome || dealOutcome.split('_')[1])}
              <div>
                <Badge className={`border text-sm px-3 py-1 rounded-full font-medium ${getOutcomeColor(analysis.analysis?.outcome || dealOutcome.split('_')[1])}`}>
                  Deal {(analysis.analysis?.outcome || dealOutcome.split('_')[1]).toUpperCase()}
                </Badge>
                {analysis.analysis?.timeline && (
                  <p className="text-caption text-slate-500 dark:text-slate-400 mt-1">
                    Timeline: {analysis.analysis.timeline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Primary Factors */}
          {analysis.analysis?.primaryFactors && analysis.analysis.primaryFactors.length > 0 && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Primary Factors
              </h4>
              <div className="space-y-3">
                {analysis.analysis.primaryFactors.map((factor, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{factor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Objection Handling */}
          {analysis.analysis?.objectionHandling && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Objection Handling
              </h4>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
                    {analysis.analysis.objectionHandling}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customer Engagement */}
          {analysis.analysis?.engagementLevel && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Customer Engagement
              </h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {analysis.analysis.engagementLevel}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Key Lessons */}
          {analysis.analysis?.keyLessons && analysis.analysis.keyLessons.length > 0 && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Key Lessons
              </h4>
              <div className="space-y-3">
                {analysis.analysis.keyLessons.map((lesson, index) => (
                  <div key={index} className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">{lesson}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Future Recommendations */}
          {analysis.analysis?.recommendations && analysis.analysis.recommendations.length > 0 && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Recommendations for Future Deals
              </h4>
              <div className="space-y-3">
                {analysis.analysis.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Target className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RAG Context */}
          {analysis.ragContext && analysis.ragContext.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-label font-medium text-blue-800 dark:text-blue-300">
                  Based on {analysis.ragContext.length} similar deals
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                AI analyzed similar deals with comparable outcomes and characteristics.
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
                onClick={() => handleFeedback('thumbs_up')}
                className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 h-8 w-8 p-0"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('thumbs_down')}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 h-8 w-8 p-0"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-label font-medium text-slate-800 dark:text-slate-100 mb-2">
            No Analysis Available
          </h4>
          <p className="text-caption text-slate-600 dark:text-slate-400">
            Click refresh to analyze deal outcome
          </p>
        </div>
      )}
    </div>
  );
} 