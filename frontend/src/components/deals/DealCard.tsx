'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { 
  CalendarIcon, 
  CurrencyDollarIcon, 
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { Deal } from '@/types';

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: deal._id || deal.id || '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate days until close
  const daysUntilClose = deal.expectedCloseDate 
    ? Math.ceil((new Date(deal.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysUntilClose !== null && daysUntilClose < 0;
  const isUrgent = daysUntilClose !== null && daysUntilClose <= 7 && daysUntilClose >= 0;

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      case 'qualified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'proposal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'closed_won': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed_lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const cardContent = (
    <div
      className={`
        bg-white/85 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/70 dark:border-slate-700/70 
        rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative
        ${isDragging || isSortableDragging ? 'opacity-50 shadow-lg scale-105' : ''}
        ${isOverdue ? 'border-red-300 dark:border-red-600' : ''}
        ${isUrgent ? 'border-orange-300 dark:border-orange-600' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing z-10"
        title="Drag to move deal"
      >
        <Bars3Icon className="w-4 h-4" />
      </div>

      {/* Clickable Content Area */}
      <Link href={`/dashboard/deals/${deal._id || deal.id}`} className="block p-4 pr-8 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
        {/* Deal Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {deal.title}
            </h4>
            {deal.company && (
              <div className="flex items-center mt-1 text-xs text-slate-600 dark:text-slate-400">
                <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                <span className="truncate">{deal.company}</span>
              </div>
            )}
          </div>
          
          {/* Priority Badge */}
          {deal.priority && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(deal.priority)}`}>
              {deal.priority}
            </span>
          )}
        </div>

        {/* Deal Value */}
        <div className="flex items-center mb-3">
          <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
          <span className="font-bold text-green-600 dark:text-green-400">
            ${deal.value.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
            {deal.probability}% prob
          </span>
        </div>

        {/* Contact Info */}
        {deal.contact && (
          <div className="flex items-center mb-3 text-xs text-slate-600 dark:text-slate-400">
            <UserIcon className="h-3 w-3 mr-1" />
            <span className="truncate">
              {deal.contact.firstName} {deal.contact.lastName}
            </span>
          </div>
        )}

        {/* Expected Close Date */}
        {deal.expectedCloseDate && (
          <div className="flex items-center mb-3 text-xs">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span className={`
              ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}
              ${isUrgent ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}
              ${!isOverdue && !isUrgent ? 'text-slate-600 dark:text-slate-400' : ''}
            `}>
              {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </span>
            {(isOverdue || isUrgent) && (
              <ExclamationTriangleIcon className={`h-3 w-3 ml-1 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} />
            )}
          </div>
        )}

        {/* Days Until Close */}
        {daysUntilClose !== null && (
          <div className="flex items-center text-xs">
            <ClockIcon className="h-3 w-3 mr-1" />
            <span className={`
              ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}
              ${isUrgent ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}
              ${!isOverdue && !isUrgent ? 'text-slate-600 dark:text-slate-400' : ''}
            `}>
              {isOverdue 
                ? `${Math.abs(daysUntilClose)} days overdue`
                : `${daysUntilClose} days left`
              }
            </span>
          </div>
        )}

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {deal.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full"
              >
                {tag}
              </span>
            ))}
            {deal.tags.length > 2 && (
              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                +{deal.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );

  // If dragging, return just the content without drag handlers
  if (isDragging) {
    return cardContent;
  }

  // Normal card with drag handlers
  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      {cardContent}
    </div>
  );
} 