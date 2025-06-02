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
  Shield
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'medium':
        return <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <Brain className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
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

  return (
    <div className={className?.includes('!p-0') ? className : `glass-card ${className || ''}`}>
      {!className?.includes('!p-0') && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-h3">AI Customer Persona</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPersona}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {/* Compact header for embedded version */}
      {className?.includes('!p-0') && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              AI Analysis
            </span>
            {lastUpdated && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPersona}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Analysis Failed</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchPersona}
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {persona && !loading && !error && (
        <div className="space-y-4">
          {/* AI Confidence - Prominent */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">AI Confidence</span>
              </div>
              <Badge className="bg-blue-600 text-white border-0 font-semibold">
                {typeof persona.confidence === 'number' ? persona.confidence : 85}%
              </Badge>
            </div>
          </div>

          {/* Engagement Level - Clean Card */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Engagement Level
              </span>
              {getEngagementIcon(persona.persona.engagementLevel)}
            </div>
            <Badge className={`${getEngagementColor(persona.persona.engagementLevel)} font-medium`}>
              {isValidValue(persona.persona.engagementLevel) 
                ? persona.persona.engagementLevel.toUpperCase() 
                : 'ANALYZING...'}
            </Badge>
          </div>

          {/* Communication & Decision Making - Side by side */}
          <div className="grid grid-cols-1 gap-3">
            {/* Communication Style */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Communication Style
                </span>
              </div>
              <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                {formatDisplayValue(persona.persona.communicationStyle, 'Style being analyzed...')}
              </p>
            </div>

            {/* Decision Making */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Decision Making
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {formatDisplayValue(persona.persona.decisionMaking, 'Decision patterns being analyzed...')}
              </p>
            </div>
          </div>

          {/* Key Motivations - Only show if has valid data */}
          {persona.persona.motivations && persona.persona.motivations.length > 0 && 
           persona.persona.motivations.some(m => isValidValue(m)) && (
            <div className="border border-green-200 dark:border-green-800 rounded-lg p-3 bg-green-50/50 dark:bg-green-900/10">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Key Motivations
                </span>
              </div>
              <div className="space-y-2">
                {persona.persona.motivations
                  .filter(motivation => isValidValue(motivation))
                  .slice(0, 3) // Limit to 3 for cleaner UI
                  .map((motivation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-green-800 dark:text-green-300">{motivation}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Key Concerns - Only show if has valid data */}
          {persona.persona.concerns && persona.persona.concerns.length > 0 && 
           persona.persona.concerns.some(c => isValidValue(c)) && (
            <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-3 bg-orange-50/50 dark:bg-orange-900/10">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                  Key Concerns
                </span>
              </div>
              <div className="space-y-2">
                {persona.persona.concerns
                  .filter(concern => isValidValue(concern))
                  .slice(0, 3) // Limit to 3 for cleaner UI
                  .map((concern, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-orange-800 dark:text-orange-300">{concern}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommended Approach - Only show if has valid data */}
          {isValidValue(persona.persona.preferredApproach) && (
            <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-3 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                  Recommended Approach
                </span>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {formatDisplayValue(persona.persona.preferredApproach)}
              </p>
            </div>
          )}

          {/* Key Insights - Only show if has valid data */}
          {persona.persona.keyInsights && persona.persona.keyInsights.length > 0 && 
           persona.persona.keyInsights.some(i => isValidValue(i)) && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Key Insights
                </span>
              </div>
              <div className="space-y-2">
                {persona.persona.keyInsights
                  .filter(insight => isValidValue(insight))
                  .slice(0, 2) // Limit to 2 for cleaner UI
                  .map((insight, index) => (
                    <div key={index} className="text-sm text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-slate-300 dark:border-slate-600">
                      {formatDisplayValue(insight)}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* RAG Context Info - Compact */}
          {persona.ragContext && persona.ragContext.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Analysis based on {persona.ragContext.length} similar customer interactions
                </span>
              </div>
            </div>
          )}

          {/* Feedback - Compact */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400">Helpful?</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('positive')}
                className="text-slate-400 hover:text-green-600 dark:text-slate-500 dark:hover:text-green-400 h-6 w-6 p-0"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback('negative')}
                className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 h-6 w-6 p-0"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* No data state */}
          {!isValidValue(persona.persona.engagementLevel) && 
           !isValidValue(persona.persona.communicationStyle) && 
           !isValidValue(persona.persona.decisionMaking) && 
           !isValidValue(persona.persona.preferredApproach) &&
           (!persona.persona.motivations || persona.persona.motivations.length === 0 || !persona.persona.motivations.some(m => isValidValue(m))) && 
           (!persona.persona.concerns || persona.persona.concerns.length === 0 || !persona.persona.concerns.some(c => isValidValue(c))) &&
           (!persona.persona.keyInsights || persona.persona.keyInsights.length === 0 || !persona.persona.keyInsights.some(i => isValidValue(i))) && (
            <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
              <Brain className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Building customer persona...</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                More interactions will improve AI analysis
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 