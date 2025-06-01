"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UserPlusIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { api, formatDateTime, formatCurrency, getStageColor, type Activity } from '@/lib/api';
import { ListItemSkeleton } from '@/components/ui/LoadingSkeleton';

interface RecentActivityFeedProps {
  className?: string;
  limit?: number;
}

interface ActivityItemProps {
  activity: Activity;
}

function getActivityIcon(type: string) {
  const iconClasses = "w-5 h-5";
  
  switch (type) {
    case 'contact_created':
      return <UserPlusIcon className={iconClasses} />;
    case 'deal_created':
    case 'deal_updated':
      return <CurrencyDollarIcon className={iconClasses} />;
    case 'note':
      return <DocumentTextIcon className={iconClasses} />;
    case 'interaction':
      return <ChatBubbleLeftRightIcon className={iconClasses} />;
    case 'stage_change':
      return <ArrowTrendingUpIcon className={iconClasses} />;
    default:
      return <ClockIcon className={iconClasses} />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'contact_created':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
    case 'deal_created':
      return 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
    case 'deal_updated':
      return 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400';
    case 'note':
      return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400';
    case 'interaction':
      return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400';
    case 'stage_change':
      return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400';
    default:
      return 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400';
  }
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityDescription = () => {
    if (activity.dealId) {
      return (
        <div className="space-y-1">
          <p className="text-body text-slate-800 dark:text-slate-100">{activity.subject}</p>
          <div className="flex items-center gap-2">
            <Link 
              href={`/deals/${activity.dealId.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              {activity.dealId.title}
            </Link>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {formatCurrency(activity.dealId.value)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(activity.dealId.stage)}`}>
              {activity.dealId.stage.replace('_', ' ')}
            </span>
          </div>
        </div>
      );
    }

    if (activity.contactId) {
      return (
        <div className="space-y-1">
          <p className="text-body text-slate-800 dark:text-slate-100">{activity.subject}</p>
          <div className="flex items-center gap-2">
            <Link 
              href={`/contacts/${activity.contactId.id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
            >
              {activity.contactId.firstName} {activity.contactId.lastName}
            </Link>
            {activity.contactId.company && (
              <>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {activity.contactId.company}
                </span>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <p className="text-body text-slate-800 dark:text-slate-100">{activity.subject}</p>
    );
  };

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        {getActivityDescription()}
        <p className="text-caption text-slate-500 dark:text-slate-400 mt-1">
          {formatDateTime(activity.date)}
        </p>
      </div>
    </div>
  );
}

export function RecentActivityFeed({ className = '', limit = 10 }: RecentActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserActivity({ limit, page: 1 });
        setActivities(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  if (error) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2">Recent Activity</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-h3 mb-2">Unable to load activity</h3>
          <p className="text-body text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2">Recent Activity</h2>
        <Link 
          href="/activity" 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <ListItemSkeleton key={index} />
          ))
        ) : activities?.length > 0 ? (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClockIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-h3 mb-2">No recent activity</h3>
            <p className="text-body text-slate-600 dark:text-slate-300 mb-4">
              Start by creating contacts or deals to see your activity here.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/contacts/new" className="btn-primary">
                Add Contact
              </Link>
              <Link href="/deals/new" className="btn-secondary">
                Create Deal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 