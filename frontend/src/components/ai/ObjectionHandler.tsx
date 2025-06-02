'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { 
  MessageSquare, 
  Send, 
  Brain,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Target,
  ArrowRight,
  Copy,
  CheckCircle
} from 'lucide-react';
import { aiService, ObjectionHandlerResponse } from '@/services/aiService';

interface ObjectionHandlerProps {
  dealId?: string;
  className?: string;
}

export function ObjectionHandler({ dealId, className }: ObjectionHandlerProps) {
  const [objectionText, setObjectionText] = useState('');
  const [category, setCategory] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [response, setResponse] = useState<ObjectionHandlerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    { value: 'price', label: 'Price' },
    { value: 'product', label: 'Product' },
    { value: 'timing', label: 'Timing' },
    { value: 'authority', label: 'Authority' },
    { value: 'need', label: 'Need' },
    { value: 'trust', label: 'Trust' },
    { value: 'competition', label: 'Competition' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!objectionText.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const objectionData = {
        objectionText: objectionText.trim(),
        ...(dealId && { dealId }),
        ...(category && { category: category as any }),
        ...(severity && { severity: severity as any })
      };
      
      const result = await aiService.handleObjection(objectionData);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to handle objection');
      console.error('Objection Handler error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFeedback = async (rating: 'thumbs_up' | 'thumbs_down') => {
    if (!response) return;
    
    try {
      console.log(`Feedback submitted: ${rating}`);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const reset = () => {
    setObjectionText('');
    setCategory('');
    setSeverity('');
    setResponse(null);
    setError(null);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-orange-600" />
          AI Objection Handler
          {response && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="ml-auto"
            >
              New Objection
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!response && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Objection Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Objection</label>
              <textarea
                value={objectionText}
                onChange={(e) => setObjectionText(e.target.value)}
                placeholder="Enter the customer's objection here..."
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                required
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category (Optional)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity (Optional)</label>
              <div className="flex gap-2 flex-wrap">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSeverity(severity === level.value ? '' : level.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      severity === level.value
                        ? level.color + ' border-current'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !objectionText.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Get AI Response
                </>
              )}
            </Button>
          </form>
        )}

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

        {response && !loading && (
          <>
            {/* Confidence Score */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">AI Confidence</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                {Math.round(response.confidence * 100)}%
              </Badge>
            </div>

            {/* AI Response */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Recommended Response
              </h4>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(response.response.response)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {response.response.response}
                </p>
              </div>

              {/* Approach */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Approach</span>
                </div>
                <p className="text-sm text-purple-700">
                  {response.response.approach}
                </p>
              </div>

              {/* Follow-up */}
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Follow-up</span>
                </div>
                <p className="text-sm text-green-700">
                  {response.response.followUp}
                </p>
              </div>

              {/* Tips */}
              {response.response.tips && response.response.tips.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Additional Tips
                  </h5>
                  <div className="space-y-2">
                    {response.response.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <Lightbulb className="h-3 w-3 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-yellow-800">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RAG Context Info */}
            {response.ragContext && response.ragContext.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Based on {response.ragContext.length} similar objections
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  AI analyzed similar objections and successful responses.
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
      </CardContent>
    </Card>
  );
} 