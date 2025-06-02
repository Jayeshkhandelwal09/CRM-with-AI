'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { 
  User, 
  RefreshCw, 
  MessageCircle, 
  Target, 
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Heart,
  AlertCircle,
  Brain,
  Lightbulb,
  Shield,
  Star,
  Activity,
  Users,
  ArrowRight,
  Zap
} from 'lucide-react';
import { aiService, PersonaBuilderResponse, type CustomerPersona } from '@/services/aiService';

interface CustomerPersonaProps {
  contactId: string;
  contactName: string;
  company?: string;
  className?: string;
}

export function CustomerPersona({ contactId, contactName, company, className }: CustomerPersonaProps) {
  const [persona, setPersona] = useState<PersonaBuilderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPersona = async () => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiService.getCustomerPersona(contactId);
      setPersona(response);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to generate customer persona');
      console.error('Customer Persona error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersona();
  }, [contactId]);

  const getEngagementColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'medium':
        return <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Brain className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getEngagementGradient = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'from-emerald-500 to-green-600';
      case 'medium':
        return 'from-yellow-500 to-orange-600';
      case 'low':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const handleFeedback = async (feedback: 'positive' | 'negative') => {
    if (!persona) return;
    
    try {
      await aiService.submitFeedback({
        feature: 'persona_builder',
        feedback,
        responseId: contactId
      });
      console.log(`Feedback submitted: ${feedback}`);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  // Helper function to check if value is meaningful
  const isValidValue = (value: any): boolean => {
    if (!value) return false;
    if (typeof value === 'string') {
      const cleanValue = value.toLowerCase().trim();
      return cleanValue !== 'unknown' && 
             cleanValue !== 'undefined' && 
             cleanValue !== 'n/a' && 
             cleanValue !== '' && 
             cleanValue !== 'null' && 
             cleanValue !== 'not available' &&
             cleanValue !== 'not specified' &&
             cleanValue.length > 2; // Ensure meaningful content
    }
    return true;
  };

  // Helper function to format display value
  const formatDisplayValue = (value: string, fallback: string = 'Analyzing...'): string => {
    return isValidValue(value) ? value : fallback;
  };

  const confidenceLevel = typeof persona?.confidence === 'number' ? persona.confidence : 85;
  const engagementLevel = persona?.persona?.engagementLevel || 'analyzing';

  // Check if we're in embedded mode
  const isEmbedded = className?.includes('!p-0');

  return (
    <div className={isEmbedded ? className : `glass-card ${className || ''}`}>
      {/* Enhanced Header */}
      {!isEmbedded && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <Activity className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-h2 font-semibold text-slate-900 dark:text-slate-100">AI Customer Persona</h3>
              {lastUpdated && (
                <p className="text-caption text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPersona}
            disabled={loading}
            className="text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 rounded-lg h-10 w-10 p-0"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {/* Compact header for embedded version */}
      {isEmbedded && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-label font-semibold text-slate-900 dark:text-slate-100">
                AI Customer Persona
              </span>
              {lastUpdated && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPersona}
            disabled={loading}
            className="text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 h-8 w-8 p-0 rounded-lg transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
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
          <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed mb-4">{error}</p>
          <Button
            onClick={fetchPersona}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      )}

      {persona && !loading && !error && (
        <div className="space-y-6">
          {/* Enhanced AI Confidence */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-label font-medium text-purple-900 dark:text-purple-100">AI Confidence Score</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 px-3 py-1 text-sm font-semibold">
                {confidenceLevel}%
              </Badge>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-purple-100 dark:bg-purple-900/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${confidenceLevel}%` }}
              />
            </div>
            
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
              Based on customer interaction patterns and behavioral analysis
            </p>
          </div>

          {/* Enhanced Engagement Level */}
          <div className={`bg-gradient-to-r ${engagementLevel === 'high' ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20' : engagementLevel === 'medium' ? 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'} rounded-xl p-6 border ${engagementLevel === 'high' ? 'border-emerald-200 dark:border-emerald-800' : engagementLevel === 'medium' ? 'border-yellow-200 dark:border-yellow-800' : 'border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-label font-semibold text-slate-900 dark:text-slate-100 mb-3 whitespace-nowrap">
                  Engagement Level
                </h4>
                <Badge className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap ${getEngagementColor(engagementLevel)}`}>
                  {isValidValue(engagementLevel) 
                    ? engagementLevel.toUpperCase() 
                    : 'ANALYZING...'}
                </Badge>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${getEngagementGradient(engagementLevel)} rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ml-4`}>
                {getEngagementIcon(engagementLevel)}
              </div>
            </div>
          </div>

          {/* Enhanced Communication & Decision Making */}
          <div className="grid gap-4">
            {/* Communication Style */}
            <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:shadow-slate-900/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div> */}
                <div className="flex-1">
                  <h4 className="text-label font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Communication Style
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {formatDisplayValue(persona.persona.communicationStyle, 'Communication patterns being analyzed...')}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </div>
            </div>

            {/* Decision Making */}
            <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:shadow-slate-900/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                {/* <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div> */}
                <div className="flex-1">
                  <h4 className="text-label font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Decision Making
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {formatDisplayValue(persona.persona.decisionMaking, 'Decision patterns being analyzed...')}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Enhanced Key Motivations */}
          {persona.persona.motivations && persona.persona.motivations.length > 0 && 
           persona.persona.motivations.some(m => isValidValue(m)) && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Key Motivations
                </h4>
              </div>
              <div className="grid gap-3">
                {persona.persona.motivations
                  .filter(motivation => isValidValue(motivation))
                  .slice(0, 3)
                  .map((motivation, index) => (
                    <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 dark:text-green-400 text-sm font-semibold">{index + 1}</span>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">{motivation}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Enhanced Key Concerns */}
          {persona.persona.concerns && persona.persona.concerns.length > 0 && 
           persona.persona.concerns.some(c => isValidValue(c)) && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Key Concerns
                </h4>
              </div>
              <div className="grid gap-3">
                {persona.persona.concerns
                  .filter(concern => isValidValue(concern))
                  .slice(0, 3)
                  .map((concern, index) => (
                    <div key={index} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">{concern}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Enhanced Recommended Approach */}
          {isValidValue(persona.persona.preferredApproach) && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Recommended Approach
                </h4>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                    {formatDisplayValue(persona.persona.preferredApproach)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Key Insights */}
          {persona.persona.keyInsights && persona.persona.keyInsights.length > 0 && 
           persona.persona.keyInsights.some(i => isValidValue(i)) && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  Key Insights
                </h4>
              </div>
              <div className="grid gap-3">
                {persona.persona.keyInsights
                  .filter(insight => isValidValue(insight))
                  .slice(0, 2)
                  .map((insight, index) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
                          {formatDisplayValue(insight)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Enhanced RAG Context */}
          {persona.ragContext && persona.ragContext.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-label font-semibold text-indigo-900 dark:text-indigo-100">
                  Data-Driven Analysis
                </span>
              </div>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                Analysis based on <strong>{persona.ragContext.length} similar customer interactions</strong> and behavioral patterns.
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

          {/* Enhanced No data state */}
          {!isValidValue(persona.persona.engagementLevel) && 
           !isValidValue(persona.persona.communicationStyle) && 
           !isValidValue(persona.persona.decisionMaking) && 
           !isValidValue(persona.persona.preferredApproach) &&
           (!persona.persona.motivations || persona.persona.motivations.length === 0 || !persona.persona.motivations.some(m => isValidValue(m))) && 
           (!persona.persona.concerns || persona.persona.concerns.length === 0 || !persona.persona.concerns.some(c => isValidValue(c))) &&
           (!persona.persona.keyInsights || persona.persona.keyInsights.length === 0 || !persona.persona.keyInsights.some(i => isValidValue(i))) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-h3 font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Building Customer Persona
              </h4>
              <p className="text-body text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                More customer interactions will help AI create a detailed personality profile
              </p>
              <Button
                onClick={fetchPersona}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Refresh Analysis
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 