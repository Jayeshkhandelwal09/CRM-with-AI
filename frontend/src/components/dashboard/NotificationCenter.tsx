"use client";

import { useState } from 'react';
import { 
  BellIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDateTime } from '@/lib/api';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  className?: string;
}

// Mock notifications - in a real app, these would come from an API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Deal Follow-up Due',
    message: 'Enterprise Software License deal needs follow-up today',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    actionUrl: '/deals/1',
  },
  {
    id: '2',
    type: 'success',
    title: 'Deal Won!',
    message: 'Congratulations! Marketing Automation deal was closed successfully',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: false,
    actionUrl: '/deals/2',
  },
  {
    id: '3',
    type: 'info',
    title: 'New Contact Added',
    message: 'Sarah Johnson from TechCorp was added to your contacts',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/contacts/3',
  },
  {
    id: '4',
    type: 'warning',
    title: 'Deal at Risk',
    message: 'Cloud Services deal has been in negotiation for 30+ days',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
    actionUrl: '/deals/4',
  },
];

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

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showAll, setShowAll] = useState(false);

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
        {displayedNotifications.length > 0 ? (
          <>
            {displayedNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
            
            {notifications.length > 3 && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {showAll ? 'Show less' : `View all ${notifications.length} notifications`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-h3 mb-2">No notifications</h3>
            <p className="text-body text-slate-600 dark:text-slate-300">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 