'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Deal, PipelineOverview } from '@/types';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { PipelineColumn } from '@/components/deals/PipelineColumn';
import { DealCard } from '@/components/deals/DealCard';
import { DealFilters } from '@/components/deals/DealFilters';
import { toast } from 'sonner';

const PIPELINE_STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'proposal', name: 'Proposal', color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'closed_won', name: 'Closed Won', color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-100 dark:bg-red-900/30' }
];

export default function DealsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DealsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DealsContent() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pipelineOverview, setPipelineOverview] = useState<PipelineOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    stage: '',
    priority: '',
    source: '',
    minValue: '',
    maxValue: '',
    expectedCloseDateFrom: '',
    expectedCloseDateTo: ''
  });

  // Load deals and pipeline overview
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadDeals(), loadPipelineOverview()]);
    };
    loadData();
  }, [searchQuery, filters]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        limit: 1000, // Load all deals for pipeline view
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        )
      };
      
      const response = await api.getDeals(params);
      if (response.success && response.data) {
        // Handle both possible response structures
        const dealsArray = (response.data as any).deals || (response.data as any).data || response.data;
        
        // Map API deals to local Deal type
        const mappedDeals = dealsArray.map((deal: unknown) => {
          const apiDeal = deal as Record<string, unknown>;
          return {
            ...apiDeal,
            id: apiDeal.id || apiDeal._id,
            _id: apiDeal._id || apiDeal.id,
            contactId: apiDeal.contact || apiDeal.contactId
          } as Deal;
        });
        setDeals(mappedDeals);
      }
    } catch (error) {
      console.error('Error loading deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const loadPipelineOverview = async () => {
    try {
      setMetricsLoading(true);
      const response = await api.getPipelineOverview();
      if (response.success && response.data) {
        setPipelineOverview(response.data);
      }
    } catch (error) {
      console.error('Error loading pipeline overview:', error);
      toast.error('Failed to load pipeline metrics');
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    
    // Find the deal being moved
    const deal = deals.find(d => (d.id || d._id) === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistically update the UI
    setDeals(prevDeals => 
      prevDeals.map(d => 
        (d.id || d._id) === dealId ? { ...d, stage: newStage as Deal['stage'] } : d
      )
    );

    try {
      // Update the deal stage on the server using PATCH endpoint
      const updateData: any = { stage: newStage };
      await api.updateDeal(dealId, updateData);
      
      // Reload pipeline overview to update metrics
      loadPipelineOverview();
      toast.success(`Deal moved to ${newStage.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating deal stage:', error);
      toast.error('Failed to update deal stage');
      // Revert the optimistic update
      setDeals(prevDeals => 
        prevDeals.map(d => 
          (d.id || d._id) === dealId ? { ...d, stage: deal.stage } : d
        )
      );
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getDealsForStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const activeDeal = activeId ? deals.find(deal => (deal.id || deal._id) === activeId) : null;

  // Metrics Skeleton Component
  const MetricsSkeleton = () => (
    <div className="glass-card">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-1"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          ))}
        </div>
        
        {/* Pipeline Breakdown */}
        <div>
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded mr-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                  </div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto mb-1"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && deals.length === 0) {
    return (
      <div className="space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-32 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1">Deals Pipeline</h1>
          <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`btn-secondary flex items-center gap-2 ${showMetrics ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''}`}
          >
            <ChartBarIcon className="w-4 h-4" />
            Metrics
          </button>
          <Link href="/dashboard/deals/new" className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            New Deal
          </Link>
        </div>
      </div>

      {/* Pipeline Metrics */}
      {showMetrics && (
        metricsLoading ? (
          <MetricsSkeleton />
        ) : pipelineOverview && (
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Pipeline Overview
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Deals</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{pipelineOverview.summary.totalDeals}</p>
                <p className="text-xs text-blue-600 dark:text-blue-300">Active pipeline</p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Value</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  ${pipelineOverview.summary.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">Pipeline value</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Avg Deal Size</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ${(pipelineOverview.summary.averageDealValue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-300">Per deal</p>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Win Rate</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {pipelineOverview.summary.winRate}%
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">Success rate</p>
              </div>
            </div>
            
            {/* Pipeline Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Pipeline Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {pipelineOverview.pipelineStages.map((stage) => {
                  // Define colors for each stage
                  const stageColors = {
                    lead: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-600',
                    qualified: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                    proposal: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                    negotiation: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                    closed_won: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                    closed_lost: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  };

                  const textColors = {
                    lead: 'text-slate-700 dark:text-slate-300',
                    qualified: 'text-blue-600 dark:text-blue-400',
                    proposal: 'text-purple-600 dark:text-purple-400',
                    negotiation: 'text-orange-600 dark:text-orange-400',
                    closed_won: 'text-green-600 dark:text-green-400',
                    closed_lost: 'text-red-600 dark:text-red-400'
                  };

                  const countColors = {
                    lead: 'text-slate-800 dark:text-slate-100',
                    qualified: 'text-blue-900 dark:text-blue-100',
                    proposal: 'text-purple-900 dark:text-purple-100',
                    negotiation: 'text-orange-900 dark:text-orange-100',
                    closed_won: 'text-green-900 dark:text-green-100',
                    closed_lost: 'text-red-900 dark:text-red-100'
                  };

                  // Add icons for each stage
                  const stageIcons = {
                    lead: '🎯',
                    qualified: '✅',
                    proposal: '📋',
                    negotiation: '🤝',
                    closed_won: '🎉',
                    closed_lost: '❌'
                  };

                  return (
                    <div 
                      key={stage.stage} 
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105 ${stageColors[stage.stage as keyof typeof stageColors]}`}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-lg mr-2">{stageIcons[stage.stage as keyof typeof stageIcons]}</span>
                          <p className={`text-xs font-medium uppercase tracking-wide ${textColors[stage.stage as keyof typeof textColors]}`}>
                            {stage.stageDisplay || stage.stage.replace('_', ' ')}
                          </p>
                        </div>
                        <p className={`text-2xl font-bold mb-1 ${countColors[stage.stage as keyof typeof countColors]}`}>
                          {stage.count}
                        </p>
                        <p className={`text-sm font-medium ${textColors[stage.stage as keyof typeof textColors]}`}>
                          ${stage.value.toLocaleString()}
                        </p>
                        {stage.count > 0 && (
                          <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                            <p className={`text-xs ${textColors[stage.stage as keyof typeof textColors]} opacity-75`}>
                              Avg: {Math.round(stage.avgProbability || 0)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {/* Search and Filters */}
      <div className="glass-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Search deals by title, company, or contact..."
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 flex-shrink-0 ${showFilters ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''}`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <DealFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClear={() => setFilters({
              stage: '',
              priority: '',
              source: '',
              minValue: '',
              maxValue: '',
              expectedCloseDateFrom: '',
              expectedCloseDateTo: ''
            })}
          />
        )}
      </div>

      {/* Pipeline Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = getDealsForStage(stage.id);
            
            return (
              <SortableContext
                key={stage.id}
                id={stage.id}
                items={stageDeals.map(deal => deal.id || deal._id || '')}
                strategy={verticalListSortingStrategy}
              >
                <PipelineColumn
                  stage={stage}
                  deals={stageDeals}
                  loading={loading}
                />
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && <DealCard deal={activeDeal} isDragging />}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {!loading && deals.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-500 mb-4">
            <ChartBarIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            No deals found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {searchQuery || Object.values(filters).some(f => f !== '') 
              ? 'Try adjusting your search or filters to find deals.'
              : 'Get started by creating your first deal.'
            }
          </p>
          <Link href="/dashboard/deals/new" className="btn-primary flex items-center gap-2 mx-auto w-fit">
            <PlusIcon className="w-4 h-4" />
            Create Deal
          </Link>
        </div>
      )}
    </div>
  );
} 