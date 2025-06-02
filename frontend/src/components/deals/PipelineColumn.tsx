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

  // Enhanced stage-specific styling
  const getStageHeaderStyle = (stageId: string) => {
    const styles = {
      lead: {
        bg: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800',
        border: 'border-slate-300 dark:border-slate-600',
        text: 'text-slate-800 dark:text-slate-200',
        badge: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300',
        icon: '🎯'
      },
      qualified: {
        bg: 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-700/40 dark:to-blue-800/40',
        border: 'border-blue-300 dark:border-blue-600',
        text: 'text-blue-900 dark:text-blue-100',
        badge: 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200',
        icon: '✅'
      },
      proposal: {
        bg: 'bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40',
        border: 'border-purple-300 dark:border-purple-600',
        text: 'text-purple-900 dark:text-purple-100',
        badge: 'bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-200',
        icon: '📋'
      },
      negotiation: {
        bg: 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40',
        border: 'border-orange-300 dark:border-orange-600',
        text: 'text-orange-900 dark:text-orange-100',
        badge: 'bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200',
        icon: '🤝'
      },
      closed_won: {
        bg: 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40',
        border: 'border-green-300 dark:border-green-600',
        text: 'text-green-900 dark:text-green-100',
        badge: 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200',
        icon: '🎉'
      },
      closed_lost: {
        bg: 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40',
        border: 'border-red-300 dark:border-red-600',
        text: 'text-red-900 dark:text-red-100',
        badge: 'bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200',
        icon: '❌'
      }
    };
    return styles[stageId as keyof typeof styles] || styles.lead;
  };

  const stageStyle = getStageHeaderStyle(stage.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col h-full min-h-[600px] rounded-xl border-2 transition-all duration-200 overflow-hidden
        ${isOver 
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 shadow-lg transform scale-[1.02]' 
          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
        }
        backdrop-blur-sm
      `}
    >
      {/* Enhanced Column Header */}
      <div className={`${stageStyle.bg} ${stageStyle.border} border-b-2 relative overflow-hidden`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>
        
        <div className="relative p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* <span className="text-lg">{stageStyle.icon}</span> */}
              <h3 className={`font-bold text-sm uppercase tracking-wide ${stageStyle.text}`}>
                {stage.name}
              </h3>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full shadow-sm ${stageStyle.badge}`}>
              {deals.length}
            </span>
          </div>
          
          {/* Enhanced Stage Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium ${stageStyle.text} opacity-80`}>Total Value:</span>
              <span className={`font-bold text-sm ${stageStyle.text}`}>
                ${totalValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium ${stageStyle.text} opacity-80`}>Weighted:</span>
              <span className={`font-bold text-sm ${stageStyle.text}`}>
                ${Math.round(totalWeightedValue).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deals List with improved background */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
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

        {/* Enhanced Empty State */}
        {!loading && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className={`w-16 h-16 rounded-full ${stageStyle.bg} ${stageStyle.border} border-2 flex items-center justify-center mb-4 shadow-sm`}>
              <span className="text-2xl">{stageStyle.icon}</span>
            </div>
            <p className={`text-sm font-medium ${stageStyle.text} mb-1`}>
              No deals in {stage.name.toLowerCase()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag deals here or create new ones
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 