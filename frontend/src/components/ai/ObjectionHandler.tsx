'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [response, setResponse] = useState<ObjectionHandlerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = [
    { value: 'price', label: 'Price' },
    { value: 'budget', label: 'Budget' },
    { value: 'timing', label: 'Timing' },
    { value: 'authority', label: 'Decision Authority' },
    { value: 'need', label: 'Need/Urgency' },
    { value: 'trust', label: 'Trust/Credibility' },
    { value: 'competitor', label: 'Competition' },
    { value: 'features', label: 'Product Features' },
    { value: 'support', label: 'Support/Service' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' },
    { value: 'high', label: 'High', color: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' },
    { value: 'critical', label: 'Critical', color: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' }
  ];

  const handleSubmit = async () => {
    if (!objectionText.trim()) {
      setError('Please enter an objection to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const objectionResponse = await aiService.handleObjection({
        objectionText: objectionText.trim(),
        category: (category || 'other') as 'price' | 'budget' | 'timing' | 'authority' | 'need' | 'trust' | 'competitor' | 'features' | 'support' | 'other',
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        dealId
      });
      setResponse(objectionResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to get objection handling advice');
      console.error('Objection Handler error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleFeedback = async (feedback: 'positive' | 'negative') => {
    if (!response) return;
    
    try {
      await aiService.submitFeedback({
        feature: 'objection_handler',
        feedback,
        responseId: objectionText
      });
      console.log(`Feedback submitted: ${feedback}`);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleReset = () => {
    setObjectionText('');
    setCategory('');
    setSeverity('medium');
    setResponse(null);
    setError(null);
  };

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-h3">AI Objection Handler</h3>
          <p className="text-caption text-slate-500 dark:text-slate-400">
            Get AI-powered strategies to handle customer objections
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        {/* Objection Text */}
        <div>
          <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
            Customer Objection
          </label>
          <textarea
            value={objectionText}
            onChange={(e) => setObjectionText(e.target.value)}
            placeholder="Enter the customer's objection here..."
            className="w-full px-3 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            rows={4}
          />
        </div>

        {/* Category and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
              Category 
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
              Severity (Optional)
            </label>
            <div className="flex gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSeverity(level.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    severity === level.value
                      ? level.color
                      : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !objectionText.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Getting AI Response...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Get AI Response
            </>
          )}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-label font-medium text-red-800 dark:text-red-300">Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}

      {/* Response */}
      {response && !loading && (
        <div className="space-y-6">
          {/* AI Confidence */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-label text-slate-700 dark:text-slate-300">AI Confidence</span>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700">
                {typeof response.confidence === 'number' ? Math.round(response.confidence) : 85}%
              </Badge>
            </div>
          </div>

          {/* Objection Analysis */}
          {response.response && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                AI Response
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {response.response.response}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Approach */}
          {response.response?.approach && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Approach
              </h4>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
                    {response.response.approach}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up */}
          {response.response?.followUp && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Follow-up
              </h4>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                    {response.response.followUp}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Response Strategies */}
          {response.response?.tips && response.response.tips.length > 0 && (
            <div>
              <h4 className="text-label text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                Additional Tips
              </h4>
              <div className="space-y-4">
                {response.response.tips.map((tip: string, index: number) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Lightbulb className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="text-label font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Tip {index + 1}
                          </h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(tip, index)}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 p-0 flex-shrink-0"
                      >
                        {copiedIndex === index ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RAG Context */}
          {response.ragContext && response.ragContext.length > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-label font-medium text-blue-800 dark:text-blue-300">
                  Based on {response.ragContext.length} similar objections
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                AI analyzed similar objections and successful responses to provide these strategies.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <span className="text-label text-slate-600 dark:text-slate-400">Was this helpful?</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('positive')}
                  className="text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 h-8 w-8 p-0"
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('negative')}
                  className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 h-8 w-8 p-0"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              New Objection
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!response && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <h4 className="text-label font-medium text-slate-800 dark:text-slate-100 mb-2">
            Ready to Handle Objections
          </h4>
          <p className="text-caption text-slate-600 dark:text-slate-400">
            Enter a customer objection above to get AI-powered response strategies
          </p>
        </div>
      )}
    </div>
  );
} 