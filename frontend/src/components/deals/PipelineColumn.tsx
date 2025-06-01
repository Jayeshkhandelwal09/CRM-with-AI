'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal } from '@/types';
import { DealCard } from './DealCard';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
}

interface PipelineColumnProps {
  stage: PipelineStage;
  deals: Deal[];
  loading?: boolean;
}

export function PipelineColumn({ stage, deals, loading }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const totalWeightedValue = deals.reduce((sum, deal) => sum + (deal.value * deal.probability) / 100, 0);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full min-h-[600px] rounded-lg border-2 transition-all duration-200
        ${isOver 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
        }
        ${stage.color}
      `}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {stage.name}
          </h3>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
            {deals.length}
          </span>
        </div>
        
        {/* Stage Metrics */}
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Total Value:</span>
            <span className="font-medium">
              ${totalValue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Weighted:</span>
            <span className="font-medium">
              ${totalWeightedValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {loading ? (
          // Loading skeletons
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <SortableContext
            items={deals.map(deal => deal._id || deal.id || '')}
            strategy={verticalListSortingStrategy}
          >
            {deals.map((deal) => (
              <DealCard
                key={deal._id || deal.id}
                deal={deal}
              />
            ))}
          </SortableContext>
        )}

        {/* Empty State */}
        {!loading && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No deals in {stage.name.toLowerCase()}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Drag deals here or create new ones
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 