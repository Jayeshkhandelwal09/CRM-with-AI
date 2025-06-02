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
  AlertCircle
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
    switch (level) {
      case 'high':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'low':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default:
        return <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
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

  return (
    <div className={`glass-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-h3">Customer Persona</h3>
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

      {persona && !loading && !error && (
        <>
          {/* Confidence Score */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Confidence</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
              {typeof persona.confidence === 'number' ? persona.confidence : 85}%
            </Badge>
          </div>

          {/* Engagement Level */}
          <div className="mb-4">
            <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Engagement Level
            </h4>
            <div className="flex items-center gap-2">
              {getEngagementIcon(persona.persona.engagementLevel)}
              <Badge className={getEngagementColor(persona.persona.engagementLevel)}>
                {persona.persona.engagementLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Communication Style */}
          <div className="mb-4">
            <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Communication Style
            </h4>
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {persona.persona.communicationStyle}
                </span>
              </div>
            </div>
          </div>

          {/* Decision Making */}
          <div className="mb-4">
            <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Decision Making
            </h4>
            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {persona.persona.decisionMaking}
              </p>
            </div>
          </div>

          {/* Motivations */}
          {persona.persona.motivations && persona.persona.motivations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Key Motivations
              </h4>
              <div className="space-y-2">
                {persona.persona.motivations.map((motivation, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <Heart className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800 dark:text-green-300">{motivation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {persona.persona.concerns && persona.persona.concerns.length > 0 && (
            <div className="mb-4">
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Key Concerns
              </h4>
              <div className="space-y-2">
                {persona.persona.concerns.map((concern, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-orange-800 dark:text-orange-300">{concern}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Approach */}
          <div className="mb-4">
            <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              Recommended Approach
            </h4>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {persona.persona.preferredApproach}
              </p>
            </div>
          </div>

          {/* Key Insights */}
          {persona.persona.keyInsights && persona.persona.keyInsights.length > 0 && (
            <div className="mb-4">
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Key Insights
              </h4>
              <div className="space-y-2">
                {persona.persona.keyInsights.map((insight, index) => (
                  <div key={index} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RAG Context Info */}
          {persona.ragContext && persona.ragContext.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Based on {persona.ragContext.length} similar interactions
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                AI analyzed similar customer interactions to build this persona.
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