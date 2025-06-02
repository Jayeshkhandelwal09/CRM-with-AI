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
  Lightbulb,
  Star,
  Activity,
  BarChart3,
  Users,
  Calendar,
  Award,
  ArrowRight
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
      return <Award className="w-6 h-6 text-white" />;
    case 'lost':
      return <XCircle className="w-6 h-6 text-white" />;
    default:
      return <Clock className="w-6 h-6 text-white" />;
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

const getOutcomeGradient = (outcome: string) => {
  switch (outcome) {
    case 'won':
      return 'from-green-500 to-emerald-600';
    case 'lost':
      return 'from-red-500 to-rose-600';
    default:
      return 'from-yellow-500 to-orange-600';
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

  const confidenceLevel = Math.round((analysis?.confidence || 0.8));
  const outcome = analysis?.analysis?.outcome || dealOutcome.split('_')[1];

  return (
    <div className={`glass-card ${className}`}>
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 bg-gradient-to-br ${getOutcomeGradient(outcome)} rounded-xl flex items-center justify-center shadow-lg`}>
              {getOutcomeIcon(outcome)}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <BarChart3 className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-h2 font-semibold text-slate-900 dark:text-slate-100">Win/Loss Analysis</h3>
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
          onClick={fetchAnalysis}
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
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
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
      {analysis && !loading && !error && (
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
              Based on deal outcome analysis and historical patterns
            </p>
          </div>

          {/* Enhanced Outcome Summary */}
          <div className={`bg-gradient-to-r ${outcome === 'won' ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'} rounded-xl p-6 border ${outcome === 'won' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getOutcomeGradient(outcome)} rounded-xl flex items-center justify-center shadow-md`}>
                {getOutcomeIcon(outcome)}
              </div>
              <div className="flex-1">
                <Badge className={`border text-sm px-4 py-2 rounded-full font-semibold ${getOutcomeColor(outcome)}`}>
                  Deal {outcome.toUpperCase()}
                </Badge>
                {analysis.analysis?.timeline && (
                  <p className={`text-sm mt-2 ${outcome === 'won' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Timeline: {analysis.analysis.timeline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Primary Factors */}
          {analysis.analysis?.primaryFactors && analysis.analysis.primaryFactors.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Primary Factors
                </h4>
              </div>
              <div className="grid gap-4">
                {analysis.analysis.primaryFactors.map((factor, index) => (
                  <div key={index} className="group bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:shadow-slate-900/20 transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">{factor}</p>
                      <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Objection Handling */}
          {analysis.analysis?.objectionHandling && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Objection Handling
                </h4>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
                    {analysis.analysis.objectionHandling}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Customer Engagement */}
          {analysis.analysis?.engagementLevel && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Customer Engagement
                </h4>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-sm text-teal-800 dark:text-teal-300 leading-relaxed">
                    {analysis.analysis.engagementLevel}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Key Lessons */}
          {analysis.analysis?.keyLessons && analysis.analysis.keyLessons.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Key Lessons
                </h4>
              </div>
              <div className="grid gap-4">
                {analysis.analysis.keyLessons.map((lesson, index) => (
                  <div key={index} className="group bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">{lesson}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Future Recommendations */}
          {analysis.analysis?.recommendations && analysis.analysis.recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Recommendations for Future Deals
                </h4>
              </div>
              <div className="grid gap-4">
                {analysis.analysis.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="group bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed flex-1">{recommendation}</p>
                      <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced RAG Context */}
          {analysis.ragContext && analysis.ragContext.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-label font-semibold text-indigo-900 dark:text-indigo-100">
                  Data-Driven Analysis
                </span>
              </div>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                This analysis is based on <strong>{analysis.ragContext.length} similar deals</strong> with comparable characteristics and outcomes in your industry.
              </p>
            </div>
          )}

          {/* Enhanced Feedback */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            <span className="text-label font-medium text-slate-700 dark:text-slate-300">How helpful was this analysis?</span>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('thumbs_up')}
                className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('thumbs_down')}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 w-9 p-0 rounded-lg transition-all duration-200"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!analysis && !loading && !error && (
        <div className="text-center py-12">
          <div className={`w-16 h-16 bg-gradient-to-br ${getOutcomeGradient(dealOutcome.split('_')[1])} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            {getOutcomeIcon(dealOutcome.split('_')[1])}
          </div>
          <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Ready to Analyze Deal Outcome
          </h4>
          <p className="text-body text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Generate comprehensive insights about why this deal was {dealOutcome.split('_')[1]} and learn for future opportunities
          </p>
          <Button
            onClick={fetchAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Generate Analysis
          </Button>
        </div>
      )}
    </div>
  );
} 