"use client";

import { UsersIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface ContactsStatsProps {
  totalContacts: number;
  isLoading: boolean;
}

export function ContactsStats({ totalContacts, isLoading }: ContactsStatsProps) {
  const stats = [
    {
      name: 'Total Contacts',
      value: totalContacts,
      icon: UsersIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      name: 'Companies',
      value: Math.floor(totalContacts * 0.6), // Estimated
      icon: BuildingOfficeIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      name: 'With Phone',
      value: Math.floor(totalContacts * 0.8), // Estimated
      icon: PhoneIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    },
    {
      name: 'With Email',
      value: Math.floor(totalContacts * 0.95), // Estimated
      icon: EnvelopeIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="glass-card hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="ml-4 w-0 flex-1 min-w-0">
              <dl>
                <dt className="text-caption text-slate-500 dark:text-slate-400 truncate">
                  {stat.name}
                </dt>
                <dd className="text-h3 font-semibold text-slate-900 dark:text-slate-100">
                  {stat.value.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 