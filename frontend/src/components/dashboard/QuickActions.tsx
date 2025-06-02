"use client";

import Link from 'next/link';
import { 
  UserPlusIcon, 
  CurrencyDollarIcon, 
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'pink';
  badge?: string;
}

interface QuickActionsProps {
  className?: string;
}

function QuickAction({ title, description, icon, href, color, badge }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70',
    green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70',
    orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/70',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/70',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/70',
    pink: 'bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/70',
  };

  return (
    <Link href={href} className="block group">
      <div className="glass-card-light hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
        {badge && (
          <div className="absolute -top-2 -right-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
            {badge}
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${colorClasses[color]}`}>
            {icon}
          </div>
          
          <div className="flex-1">
            <h3 className="text-h3 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <p className="text-body text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function QuickActions({ className = '' }: QuickActionsProps) {
  const actions: QuickActionProps[] = [
    {
      title: 'Add New Contact',
      description: 'Create a new contact and start building relationships',
      icon: <UserPlusIcon className="w-6 h-6" />,
      href: '/contacts/new',
      color: 'blue' as const,
    },
    {
      title: 'Create Deal',
      description: 'Start tracking a new sales opportunity',
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      href: '/dashboard/deals/new',
      color: 'green' as const,
    },
    {
      title: 'Import Contacts',
      description: 'Upload contacts from CSV file',
      icon: <DocumentArrowUpIcon className="w-6 h-6" />,
      href: '/contacts/import',
      color: 'orange' as const,
    },
    {
      title: 'Search Everything',
      description: 'Find contacts, deals, and activities quickly',
      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
      href: '/search',
      color: 'purple' as const,
    },
    {
      title: 'View Analytics',
      description: 'Analyze your sales performance and trends',
      icon: <ChartBarIcon className="w-6 h-6" />,
      href: '/dashboard/analytics',
      color: 'indigo' as const,
    },
    {
      title: 'AI Assistant',
      description: 'Get AI-powered insights and recommendations',
      icon: <SparklesIcon className="w-6 h-6" />,
      href: '/dashboard/ai',
      color: 'pink' as const,
    },
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2">Quick Actions</h2>
        <p className="text-caption text-slate-500 dark:text-slate-400">
          Common tasks to get you started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <QuickAction
            key={action.title}
            title={action.title}
            description={action.description}
            icon={action.icon}
            href={action.href}
            color={action.color}
            badge={action.badge}
          />
        ))}
      </div>
    </div>
  );
} 