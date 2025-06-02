"use client";

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { api, formatDateTime } from '@/lib/api';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  dealId?: string;
  contactId?: string;
}

interface NotificationCenterProps {
  className?: string;
}

function getNotificationIcon(type: string) {
  const iconClasses = "w-5 h-5";
  
  switch (type) {
    case 'warning':
      return <ExclamationTriangleIcon className={iconClasses} />;
    case 'success':
      return <CheckCircleIcon className={iconClasses} />;
    case 'reminder':
      return <ClockIcon className={iconClasses} />;
    default:
      return <InformationCircleIcon className={iconClasses} />;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'warning':
      return 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400';
    case 'success':
      return 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
    case 'reminder':
      return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
    default:
      return 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400';
  }
}

function NotificationItem({ notification, onMarkAsRead }: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
}) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div 
      className={`p-4 border-l-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
        notification.read 
          ? 'border-slate-200 dark:border-slate-700 opacity-75' 
          : 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${
              notification.read 
                ? 'text-slate-600 dark:text-slate-300' 
                : 'text-slate-800 dark:text-slate-100'
            }`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>
          
          <p className={`text-sm mt-1 ${
            notification.read 
              ? 'text-slate-500 dark:text-slate-400' 
              : 'text-slate-600 dark:text-slate-300'
          }`}>
            {notification.message}
          </p>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {formatDateTime(notification.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Generate smart notifications based on real data
function generateSmartNotifications(userStats: any, pipelineData: any, recentActivity: any[]): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // Deal follow-up reminders based on real deals
  if (pipelineData?.summary?.activeDeals > 0) {
    notifications.push({
      id: 'deal-followup-1',
      type: 'reminder',
      title: 'Deal Follow-up Due',
      message: `You have ${pipelineData.summary.activeDeals} active deals that may need attention`,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/dashboard/deals',
    });
  }

  // Overdue deals warning
  if (pipelineData?.summary?.overdueDeals > 0) {
    notifications.push({
      id: 'overdue-deals',
      type: 'warning',
      title: 'Overdue Deals',
      message: `${pipelineData.summary.overdueDeals} deals are overdue and need immediate attention`,
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/dashboard/deals?filter=overdue',
    });
  }

  // Win rate performance
  if (pipelineData?.summary?.winRate > 70) {
    notifications.push({
      id: 'high-winrate',
      type: 'success',
      title: 'Great Performance!',
      message: `Your win rate is ${pipelineData.summary.winRate}% - keep up the excellent work!`,
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
    });
  } else if (pipelineData?.summary?.winRate < 30) {
    notifications.push({
      id: 'low-winrate',
      type: 'warning',
      title: 'Win Rate Alert',
      message: `Your win rate is ${pipelineData.summary.winRate}%. Consider reviewing your sales strategy.`,
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/dashboard/analytics',
    });
  }

  // AI usage notifications
  if (userStats?.aiRequestsToday >= 80) {
    notifications.push({
      id: 'ai-usage-high',
      type: 'info',
      title: 'AI Usage Alert',
      message: `You've used ${userStats.aiRequestsToday}/100 AI requests today. Consider upgrading for unlimited access.`,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/dashboard/ai',
    });
  }

  // Recent activity notifications
  if (recentActivity?.length > 0) {
    const recentDealActivity = recentActivity.find(activity => 
      activity.type === 'deal_created' || activity.type === 'deal_updated'
    );
    
    if (recentDealActivity && recentDealActivity.dealId) {
      notifications.push({
        id: `activity-${recentDealActivity.id}`,
        type: 'info',
        title: 'Recent Deal Activity',
        message: `${recentDealActivity.subject}`,
        timestamp: recentDealActivity.date,
        read: true,
        actionUrl: `/dashboard/deals/${recentDealActivity.dealId.id}`,
        dealId: recentDealActivity.dealId.id,
      });
    }
  }

  // Contact limit warning
  if (userStats?.contactsUsagePercentage >= 90) {
    notifications.push({
      id: 'contact-limit',
      type: 'warning',
      title: 'Contact Limit Warning',
      message: `You're using ${userStats.contactsUsagePercentage}% of your contact limit. Consider upgrading your plan.`,
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/contacts',
    });
  }

  return notifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data needed to generate smart notifications
        const [userProfileResponse, pipelineResponse, activityResponse] = await Promise.all([
          api.getUserProfile(),
          api.getPipelineOverview(),
          api.getUserActivity({ limit: 10, page: 1 })
        ]);

        const userStats = userProfileResponse.data.stats;
        const pipelineData = pipelineResponse.data;
        const recentActivity = activityResponse.data.data || [];

        // Generate smart notifications based on real data
        const smartNotifications = generateSmartNotifications(userStats, pipelineData, recentActivity);
        setNotifications(smartNotifications);
        
      } catch (err) {
        console.error('Failed to fetch notification data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load notifications');
        
        // Fallback to basic notifications
        setNotifications([
          {
            id: 'welcome',
            type: 'info',
            title: 'Welcome to CRM AI',
            message: 'Start by adding your first contact or deal to get personalized insights.',
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: '/contacts',
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  if (error && notifications.length === 0) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <h2 className="text-h2">Notifications</h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-h3 mb-2">Unable to load notifications</h3>
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
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <h2 className="text-h2">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedNotifications.length > 0 ? (
          displayedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <BellIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-h3 mb-2">No notifications</h3>
            <p className="text-body text-slate-600 dark:text-slate-300">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        )}
      </div>

      {notifications.length > 3 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            {showAll ? 'Show less' : `View all ${notifications.length} notifications`}
          </button>
        </div>
      )}
    </div>
  );
} 