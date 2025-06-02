"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  api, 
  type Contact, 
  formatDate, 
  formatDateTime,
  getContactStatusColor, 
  getLeadSourceColor, 
  getPriorityColor 
} from "@/lib/api";
import { 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ClockIcon,
  ChartBarIcon,
  HomeIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { ContactInteractionHistory } from '@/components/contacts/ContactInteractionHistory';
import { CustomerPersona } from '@/components/ai';

export default function ContactDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContactDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Custom Breadcrumb Component for Contact Details
function ContactBreadcrumb({ contact }: { contact: Contact | null }) {
  if (!contact) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 px-1">
      <HomeIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      
      <Link
        href="/dashboard"
        className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        Dashboard
      </Link>
      
      <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      
      <Link
        href="/contacts"
        className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        Contacts
      </Link>
      
      <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      
      <span className="text-slate-800 dark:text-slate-100 font-medium">
        {contact.firstName} {contact.lastName}
      </span>
    </nav>
  );
}

function ContactDetailContent() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInteractionHistory, setShowInteractionHistory] = useState(false);

  const fetchContact = useCallback(async () => {
    if (!contactId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getContact(contactId);
      
      if (response.success) {
        const contact = response.data;
        // Map _id to id for frontend compatibility
        setContact({
          ...contact,
          id: contact._id || contact.id
        });
      } else {
        throw new Error(response.error || 'Failed to fetch contact');
      }
    } catch (err) {
      console.error('Failed to fetch contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contact');
      toast.error('Failed to load contact');
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId, fetchContact]);

  // Update page title when contact is loaded
  useEffect(() => {
    if (contact) {
      document.title = `${contact.firstName} ${contact.lastName} - Contact Details | CRM AI`;
    }
    
    // Cleanup: reset title when component unmounts
    return () => {
      document.title = 'CRM AI';
    };
  }, [contact]);

  const handleDeleteContact = async () => {
    try {
      await api.deleteContact(contactId);
      toast.success('Contact deleted successfully');
      router.push('/contacts');
    } catch (err) {
      console.error('Failed to delete contact:', err);
      toast.error('Failed to delete contact');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 mb-6 px-1">
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <div>
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3 space-y-4">
            <div className="glass-card animate-pulse p-4">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass-card animate-pulse p-4">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb for error state */}
        <nav className="flex items-center space-x-2 text-sm mb-6 px-1">
          <HomeIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Link
            href="/dashboard"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Link
            href="/contacts"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            Contacts
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-800 dark:text-slate-100 font-medium">
            Contact Not Found
          </span>
        </nav>

        <div className="glass-card">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-h3 text-slate-900 dark:text-slate-100">
              {error || 'Contact not found'}
            </h3>
            <p className="mt-1 text-body text-slate-500 dark:text-slate-400">
              The contact you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <div className="mt-6">
              <Link href="/contacts" className="btn-primary">
                Back to Contacts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Custom Breadcrumb */}
        <ContactBreadcrumb contact={contact} />

        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/contacts"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-xl shadow-lg">
                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {contact.firstName} {contact.lastName}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {contact.jobTitle && contact.company 
                    ? `${contact.jobTitle} at ${contact.company}`
                    : contact.jobTitle || contact.company || 'Contact Details'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </Link>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Enhanced Layout - More space for AI component */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            {/* Contact Information - Enhanced */}
            <div className="glass-card p-6">
              <h2 className="text-h2 font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-1">Email</div>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {contact.phone && (
                  <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <PhoneIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-1">Phone</div>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-sm text-green-600 dark:text-green-400 hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company */}
                {contact.company && (
                  <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-1">Company</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {contact.company}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Job Title */}
                {contact.jobTitle && (
                  <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-1">Job Title</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {contact.jobTitle}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department */}
                {contact.department && (
                  <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-1">Department</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {contact.department}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {contact.website && (
                  <div className="group bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <GlobeAltIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-1">Website</div>
                        <a 
                          href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate block"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Address - Full width if exists */}
              {contact.address && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-label font-medium text-slate-900 dark:text-slate-100 mb-2">Address</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          {contact.address.street && <div>{contact.address.street}</div>}
                          {(contact.address.city || contact.address.state || contact.address.zipCode) && (
                            <div>
                              {contact.address.city}
                              {contact.address.city && contact.address.state && ', '}
                              {contact.address.state} {contact.address.zipCode}
                            </div>
                          )}
                          {contact.address.country && <div>{contact.address.country}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status, Priority, Source - Enhanced Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              {contact.status && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-label font-semibold text-slate-900 dark:text-slate-100">Status</span>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getContactStatusColor(contact.status)}`}>
                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                </div>
              )}

              {/* Priority */}
              {contact.priority && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-label font-semibold text-slate-900 dark:text-slate-100">Priority</span>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(contact.priority)}`}>
                    {contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)}
                  </span>
                </div>
              )}

              {/* Lead Source */}
              {contact.leadSource && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-label font-semibold text-slate-900 dark:text-slate-100">Lead Source</span>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getLeadSourceColor(contact.leadSource)}`}>
                    {contact.leadSource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              )}
            </div>

            {/* Notes & Description - Enhanced */}
            {(contact.notes || contact.description) && (
              <div className="glass-card p-6">
                <h2 className="text-h2 font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-white" />
                  </div>
                  Notes & Description
                </h2>
                
                <div className="space-y-6">
                  {contact.description && (
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                      <h3 className="text-label font-semibold text-slate-900 dark:text-slate-100 mb-3">Description</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {contact.description}
                      </p>
                    </div>
                  )}
                  
                  {contact.notes && (
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                      <h3 className="text-label font-semibold text-slate-900 dark:text-slate-100 mb-3">Notes</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {contact.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Tags - Moved from sidebar */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-h2 font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <TagIcon className="w-4 h-4 text-white" />
                  </div>
                  Tags
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-50 to-rose-50 text-pink-800 border border-pink-200 dark:from-pink-900/20 dark:to-rose-900/20 dark:text-pink-300 dark:border-pink-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Timeline - Moved from sidebar */}
            <div className="glass-card p-6">
              <h2 className="text-h2 font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                Timeline
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-label font-semibold text-slate-900 dark:text-slate-100">Created</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(contact.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="text-label font-semibold text-slate-900 dark:text-slate-100">Last Updated</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(contact.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {contact.lastContactDate && (
                  <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-label font-semibold text-slate-900 dark:text-slate-100">Last Contact</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(contact.lastContactDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {contact.nextFollowUpDate && (
                  <div className="bg-white dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-label font-semibold text-slate-900 dark:text-slate-100">Next Follow-up</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(contact.nextFollowUpDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - 1 column with scrollable AI component */}
          <div className="space-y-6">
            {/* AI Customer Persona - Scrollable with increased height */}
            <div className="glass-card p-0 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-h2 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  AI Customer Persona
                </h2>
              </div>
              <div className="max-h-[1000px] overflow-y-auto p-6">
                <CustomerPersona 
                  contactId={contact.id || contact._id || ''}
                  contactName={`${contact.firstName} ${contact.lastName}`}
                  company={contact.company}
                  className="!p-0 !bg-transparent !border-0 !shadow-none"
                />
              </div>
            </div>

            {/* Enhanced Activity Overview - Moved to sidebar */}
            {contact.interactionCount !== undefined && (
              <div className="glass-card p-6">
                <h2 className="text-h3 font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-white" />
                  </div>
                  Activity Overview
                </h2>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                      {contact.interactionCount}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Total Interactions
                  </div>
                  
                  <button
                    onClick={() => setShowInteractionHistory(true)}
                    className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    View History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Delete Contact
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete <strong>{contact.firstName} {contact.lastName}</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDeleteContact}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interaction History Modal */}
      {contact && (
        <ContactInteractionHistory
          contactId={contact.id || contact._id || ''}
          contactName={`${contact.firstName} ${contact.lastName}`}
          isOpen={showInteractionHistory}
          onClose={() => setShowInteractionHistory(false)}
        />
      )}
    </>
  );
} 