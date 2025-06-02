'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { 
  User, 
  RefreshCw, 
  MessageCircle, 
  Brain,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Target,
  TrendingUp,
  Clock,
  Lightbulb
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleFeedback = async (rating: 'thumbs_up' | 'thumbs_down') => {
    if (!persona) return;
    
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
          <User className="h-5 w-5 text-blue-600" />
          Customer Persona
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPersona}
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

        {persona && !loading && !error && (
          <>
            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">AI Confidence</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                {Math.round(persona.confidence * 100)}%
              </Badge>
            </div>

            {/* Communication Style */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Communication Style
              </h4>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {persona.persona.communicationStyle || 'Unknown'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Decision Making: {persona.persona.decisionMaking || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Engagement Level */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Engagement Level
              </h4>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                {getEngagementIcon(persona.persona.engagementLevel)}
                <Badge 
                  variant="outline" 
                  className={getEngagementColor(persona.persona.engagementLevel)}
                >
                  {persona.persona.engagementLevel.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Motivations */}
            {persona.persona.motivations && persona.persona.motivations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Key Motivations
                </h4>
                <div className="space-y-2">
                  {persona.persona.motivations.map((motivation, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <Target className="h-3 w-3 text-green-600" />
                      <span className="text-sm text-green-800">{motivation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {persona.persona.concerns && persona.persona.concerns.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Key Concerns
                </h4>
                <div className="space-y-2">
                  {persona.persona.concerns.map((concern, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                      <AlertTriangle className="h-3 w-3 text-orange-600" />
                      <span className="text-sm text-orange-800">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Approach */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Recommended Approach
              </h4>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {persona.persona.preferredApproach}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {persona.persona.keyInsights && persona.persona.keyInsights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {persona.persona.keyInsights.map((insight, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RAG Context Info */}
            {persona.ragContext && persona.ragContext.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Based on {persona.ragContext.length} similar customer patterns
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  AI analyzed similar customer interactions to build this persona.
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

        {!persona && !loading && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click refresh to generate customer persona</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 