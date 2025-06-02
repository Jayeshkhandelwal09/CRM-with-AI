import { api } from '../lib/api';

/**
 * AI Service for Frontend
 * 
 * Handles all AI-related API calls to the backend
 */

// Types for AI responses
export interface DealCoachSuggestion {
  action: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
}

export interface DealCoachResponse {
  suggestions: DealCoachSuggestion[];
  confidence: number;
  ragContext: Array<{
    id: string;
    similarity: number;
    industry: string;
    value: number;
    outcome: string;
  }>;
  timestamp: string;
}

export interface ObjectionResponse {
  response: string;
  approach: string;
  followUp: string;
  tips: string[];
}

export interface ObjectionHandlerResponse {
  response: ObjectionResponse;
  confidence: number;
  ragContext: Array<{
    id: string;
    similarity: number;
    category: string;
    severity: string;
    outcome: string;
  }>;
  timestamp: string;
}

export interface CustomerPersona {
  communicationStyle: string;
  decisionMaking: string;
  motivations: string[];
  concerns: string[];
  engagementLevel: 'high' | 'medium' | 'low';
  preferredApproach: string;
  keyInsights: string[];
}

export interface PersonaBuilderResponse {
  persona: CustomerPersona;
  confidence: number;
  ragContext: Array<{
    id: string;
    similarity: number;
    type: string;
    industry: string;
    outcome: string;
  }>;
  timestamp: string;
  lastUpdated: string;
}

export interface WinLossAnalysis {
  outcome: 'won' | 'lost';
  primaryFactors: string[];
  timeline: string;
  objectionHandling: string;
  engagementLevel: string;
  keyLessons: string[];
  recommendations: string[];
}

export interface WinLossExplainerResponse {
  analysis: WinLossAnalysis;
  confidence: number;
  ragContext: Array<{
    id: string;
    similarity: number;
    industry: string;
    value: number;
    outcome: string;
    duration: number;
  }>;
  timestamp: string;
}

export interface AIAnalytics {
  period: string;
  totalRequests: number;
  todaysUsage: number;
  remainingRequests: number;
  positiveFeedback: number;
  avgResponseTime: number;
  featureUsage: Record<string, number>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface AIHealthStatus {
  status: string;
  healthy: boolean;
  openai: {
    status: string;
    model: string;
  };
  vectorDatabase: {
    status: string;
    healthy: boolean;
    collections: Record<string, {
      name: string;
      count: number;
      status: string;
    }>;
    timestamp: string;
  };
  cache: {
    size: number;
    status: string;
  };
  timestamp: string;
}

/**
 * AI Service Class
 */
class AIService {
  /**
   * Get AI coaching suggestions for a deal
   */
  async getDealCoach(dealId: string): Promise<DealCoachResponse> {
    try {
      const response = await api.getDealCoach(dealId);
      return response.data;
    } catch (error: any) {
      console.error('Deal Coach API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get deal coaching suggestions');
    }
  }

  /**
   * Handle customer objections with AI
   */
  async handleObjection(objectionData: {
    objectionText: string;
    dealId?: string;
    category?: 'price' | 'product' | 'timing' | 'authority' | 'need' | 'trust' | 'competition' | 'other';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ObjectionHandlerResponse> {
    try {
      const response = await api.handleObjection(objectionData);
      return response.data;
    } catch (error: any) {
      console.error('Objection Handler API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to handle objection');
    }
  }

  /**
   * Get AI-generated customer persona
   */
  async getCustomerPersona(contactId: string): Promise<PersonaBuilderResponse> {
    try {
      const response = await api.getCustomerPersona(contactId);
      return response.data;
    } catch (error: any) {
      console.error('Persona Builder API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate customer persona');
    }
  }

  /**
   * Get AI analysis of why a deal was won or lost
   */
  async explainWinLoss(dealId: string): Promise<WinLossExplainerResponse> {
    try {
      const response = await api.explainWinLoss(dealId);
      return response.data;
    } catch (error: any) {
      console.error('Win/Loss Explainer API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to explain deal outcome');
    }
  }

  /**
   * Submit feedback on AI responses
   */
  async submitFeedback(feedbackData: {
    feature: 'deal_coach' | 'objection_handler' | 'persona_builder' | 'win_loss_explainer';
    feedback: 'positive' | 'negative';
    responseId?: string;
    rating?: number;
    comments?: string;
  }): Promise<void> {
    try {
      const response = await api.submitAIFeedback(feedbackData);
      return response.data;
    } catch (error: any) {
      console.error('AI Feedback API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit feedback');
    }
  }

  /**
   * Get AI usage analytics
   */
  async getAnalytics(period: '1d' | '7d' | '30d' = '7d'): Promise<AIAnalytics> {
    try {
      const response = await api.getAIAnalytics(period);
      return response.data;
    } catch (error: any) {
      console.error('AI Analytics API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get AI analytics');
    }
  }

  /**
   * Check AI services health
   */
  async getHealthStatus(): Promise<AIHealthStatus> {
    try {
      const response = await api.getAIHealthStatus();
      return response.data;
    } catch (error: any) {
      console.error('AI Health Check API error:', error);
      throw new Error(error.response?.data?.message || 'Failed to check AI health');
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService; 