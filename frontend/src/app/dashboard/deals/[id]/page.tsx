'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Deal } from '@/types';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

export default function DealDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DealDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DealDetailContent() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dealId) {
      loadDeal();
    }
  }, [dealId]);

  const loadDeal = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDeal(dealId);
      if (response.success && response.data) {
        // Handle both possible response structures
        const dealData = (response.data as any).deal || response.data;
        
        // Map API deal to local Deal type
        const mappedDeal = {
          ...dealData,
          id: dealData.id || dealData._id,
          _id: dealData._id || dealData.id,
          contactId: dealData.contact?._id || dealData.contact || dealData.contactId
        } as Deal;
        setDeal(mappedDeal);
      } else {
        setError('Deal not found');
      }
    } catch (err) {
      console.error('Error loading deal:', err);
      setError('Failed to load deal');
      toast.error('Failed to load deal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deal || !confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      await api.deleteDeal(dealId);
      toast.success('Deal deleted successfully');
      router.push('/dashboard/deals');
    } catch (err) {
      console.error('Error deleting deal:', err);
      toast.error('Failed to delete deal');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-500 mb-4">
          <ChartBarIcon className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          {error || 'Deal not found'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The deal you are looking for does not exist or has been deleted.
        </p>
        <Link href="/dashboard/deals" className="btn-primary flex items-center gap-2 mx-auto w-fit">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Deals
        </Link>
      </div>
    );
  }

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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/deals"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-h1">{deal.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStageColor(deal.stage)}`}>
                {deal.stageDisplay || deal.stage.replace('_', ' ')}
              </span>
              {deal.priority && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(deal.priority)}`}>
                  {deal.priority}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/deals/${dealId}/edit`}
            className="btn-secondary flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="btn-danger flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Overview */}
          <div className="glass-card">
            <h2 className="text-h2 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Deal Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                  <div>
                    <p className="text-label text-slate-600 dark:text-slate-400">Deal Value</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${deal.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <p className="text-label text-slate-600 dark:text-slate-400">Probability</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {deal.probability}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {deal.expectedCloseDate && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                    <div>
                      <p className="text-label text-slate-600 dark:text-slate-400">Expected Close</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {deal.ageInDays && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3" />
                    <div>
                      <p className="text-label text-slate-600 dark:text-slate-400">Deal Age</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {deal.ageInDays} days
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {deal.description && (
              <div className="mt-6">
                <h3 className="text-label text-slate-900 dark:text-slate-100 mb-2">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {deal.description}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {deal.notes && (
            <div className="glass-card">
              <h2 className="text-h2 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Notes
              </h2>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {deal.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          {deal.contact && (
            <div className="glass-card">
              <h3 className="text-h2 mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-slate-400 mr-3" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {deal.contact.firstName} {deal.contact.lastName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {deal.contact.email}
                    </p>
                  </div>
                </div>
                
                {deal.company && (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-slate-400 mr-3" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {deal.company}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deal Details */}
          <div className="glass-card">
            <h3 className="text-h2 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              {deal.source && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Source:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {deal.source.replace('_', ' ')}
                  </span>
                </div>
              )}
              
              {deal.dealType && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                    {deal.dealType.replace('_', ' ')}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Created:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {new Date(deal.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {new Date(deal.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div className="glass-card">
              <h3 className="text-h2 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {deal.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 