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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { ContactInteractionHistory } from '@/components/contacts/ContactInteractionHistory';

export default function ContactDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContactDetailContent />
      </DashboardLayout>
    </ProtectedRoute>
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
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2"></div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-20 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card animate-pulse">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card animate-pulse">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
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
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/contacts"
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg">
                {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-h1">{contact.firstName} {contact.lastName}</h1>
                <p className="text-body text-slate-600 dark:text-slate-300">
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
              className="btn-secondary flex items-center gap-2"
            >
              <PencilIcon className="w-4 h-4" />
              Edit
            </Link>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="glass-card">
              <h2 className="text-h2 mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-label text-slate-500 dark:text-slate-400">Email</div>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-body text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>

                  {contact.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-label text-slate-500 dark:text-slate-400">Phone</div>
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-body text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-label text-slate-500 dark:text-slate-400">Company</div>
                        <div className="text-body text-slate-900 dark:text-slate-100">
                          {contact.company}
                        </div>
                      </div>
                    </div>
                  )}

                  {contact.website && (
                    <div className="flex items-center gap-3">
                      <GlobeAltIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-label text-slate-500 dark:text-slate-400">Website</div>
                        <a 
                          href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {contact.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {contact.jobTitle && (
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-label text-slate-500 dark:text-slate-400">Job Title</div>
                        <div className="text-body text-slate-900 dark:text-slate-100">
                          {contact.jobTitle}
                        </div>
                      </div>
                    </div>
                  )}

                  {contact.department && (
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                      <div>
                        <div className="text-label text-slate-500 dark:text-slate-400">Department</div>
                        <div className="text-body text-slate-900 dark:text-slate-100">
                          {contact.department}
                        </div>
                      </div>
                    </div>
                  )}

                  {contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPinIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <div className="text-label text-slate-500 dark:text-slate-400">Address</div>
                        <div className="text-body text-slate-900 dark:text-slate-100">
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
                  )}
                </div>
              </div>
            </div>

            {/* Notes & Description */}
            {(contact.notes || contact.description) && (
              <div className="glass-card">
                <h2 className="text-h2 mb-4">Notes & Description</h2>
                
                {contact.description && (
                  <div className="mb-4">
                    <h3 className="text-h3 mb-2">Description</h3>
                    <p className="text-body text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {contact.description}
                    </p>
                  </div>
                )}
                
                {contact.notes && (
                  <div>
                    <h3 className="text-h3 mb-2">Notes</h3>
                    <p className="text-body text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {contact.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="glass-card">
              <h2 className="text-h2 mb-4">Status & Priority</h2>
              
              <div className="space-y-4">
                {contact.status && (
                  <div>
                    <div className="text-label text-slate-500 dark:text-slate-400 mb-1">Status</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getContactStatusColor(contact.status)}`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </div>
                )}

                {contact.priority && (
                  <div>
                    <div className="text-label text-slate-500 dark:text-slate-400 mb-1">Priority</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(contact.priority)}`}>
                      {contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)}
                    </span>
                  </div>
                )}

                {contact.leadSource && (
                  <div>
                    <div className="text-label text-slate-500 dark:text-slate-400 mb-1">Lead Source</div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLeadSourceColor(contact.leadSource)}`}>
                      {contact.leadSource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="glass-card">
                <h2 className="text-h2 mb-4 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  Tags
                </h2>
                
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dates & Timeline */}
            <div className="glass-card">
              <h2 className="text-h2 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Timeline
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-label text-slate-500 dark:text-slate-400">Created</div>
                  <div className="text-body text-slate-900 dark:text-slate-100">
                    {formatDateTime(contact.createdAt)}
                  </div>
                </div>

                <div>
                  <div className="text-label text-slate-500 dark:text-slate-400">Last Updated</div>
                  <div className="text-body text-slate-900 dark:text-slate-100">
                    {formatDateTime(contact.updatedAt)}
                  </div>
                </div>

                {contact.lastContactDate && (
                  <div>
                    <div className="text-label text-slate-500 dark:text-slate-400">Last Contact</div>
                    <div className="text-body text-slate-900 dark:text-slate-100">
                      {formatDate(contact.lastContactDate)}
                    </div>
                  </div>
                )}

                {contact.nextFollowUpDate && (
                  <div>
                    <div className="text-label text-slate-500 dark:text-slate-400">Next Follow-up</div>
                    <div className="text-body text-slate-900 dark:text-slate-100">
                      {formatDate(contact.nextFollowUpDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction Count */}
            {contact.interactionCount !== undefined && (
              <div className="glass-card">
                <h2 className="text-h2 mb-4">Activity</h2>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {contact.interactionCount}
                  </div>
                  <div className="text-label text-slate-500 dark:text-slate-400 mb-4">
                    Total Interactions
                  </div>
                  
                  <button
                    onClick={() => setShowInteractionHistory(true)}
                    className="btn-secondary w-full"
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