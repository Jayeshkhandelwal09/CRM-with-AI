'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CurrencyDollarIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Deal, Contact } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function EditDealPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <EditDealContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function EditDealContent() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    stage: 'lead' as Deal['stage'],
    probability: '10',
    expectedCloseDate: '',
    contactId: '',
    company: '',
    source: 'other',
    dealType: 'new_business',
    priority: 'medium' as Deal['priority'],
    notes: '',
    tags: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dealId) {
      loadDeal();
      loadContacts();
    }
  }, [dealId]);

  const loadDeal = async () => {
    try {
      setInitialLoading(true);
      const response = await api.getDeal(dealId);
      if (response.success && response.data) {
        const dealData = (response.data as any).deal || response.data;
        
        const mappedDeal = {
          ...dealData,
          id: dealData.id || dealData._id,
          _id: dealData._id || dealData.id,
          contactId: dealData.contact?._id || dealData.contact || dealData.contactId
        } as Deal;
        
        setDeal(mappedDeal);
        
        // Populate form with deal data
        setFormData({
          title: mappedDeal.title || '',
          description: mappedDeal.description || '',
          value: mappedDeal.value?.toString() || '',
          stage: mappedDeal.stage || 'lead',
          probability: mappedDeal.probability?.toString() || '10',
          expectedCloseDate: mappedDeal.expectedCloseDate ? new Date(mappedDeal.expectedCloseDate).toISOString().split('T')[0] : '',
          contactId: mappedDeal.contactId || '',
          company: mappedDeal.company || '',
          source: mappedDeal.source || 'other',
          dealType: mappedDeal.dealType || 'new_business',
          priority: mappedDeal.priority || 'medium',
          notes: mappedDeal.notes || '',
          tags: mappedDeal.tags || []
        });
      }
    } catch (error) {
      console.error('Error loading deal:', error);
      toast.error('Failed to load deal');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await api.getContacts({ limit: 1000 });
      
      if (response.success && response.data) {
        // Handle both possible response structures
        const contactsArray = response.data.data || response.data.contacts || response.data;
        
        if (Array.isArray(contactsArray)) {
          // Map API contacts to local Contact type
          const mappedContacts = contactsArray.map((contact: unknown) => {
            const apiContact = contact as Record<string, unknown>;
            return {
              ...apiContact,
              id: apiContact.id || apiContact._id,
              _id: apiContact._id || apiContact.id
            } as Contact;
          });
          setContacts(mappedContacts);
        } else {
          console.error('Contacts data is not an array:', contactsArray);
          toast.error('Invalid contacts data format');
        }
      } else {
        console.error('Failed to load contacts:', response);
        toast.error('Failed to load contacts');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill company when contact is selected
    if (name === 'contactId' && value) {
      const selectedContact = contacts.find(c => (c._id || c.id) === value);
      if (selectedContact && selectedContact.company && !formData.company) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          company: selectedContact.company || ''
        }));
        toast.success('Company auto-filled from contact');
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dealData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        value: parseFloat(formData.value),
        stage: formData.stage,
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate,
        contact: formData.contactId,
        company: formData.company.trim() || undefined,
        source: formData.source,
        dealType: formData.dealType,
        priority: formData.priority,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags.filter(tag => tag.trim())
      };

      const response = await api.updateDeal(dealId, dealData);
      if (response.success) {
        toast.success('Deal updated successfully');
        router.push(`/dashboard/deals/${dealId}`);
      } else {
        setErrors({ submit: response.error || 'Failed to update deal' });
        toast.error(response.error || 'Failed to update deal');
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      setErrors({ submit: 'Failed to update deal' });
      toast.error('Failed to update deal');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    // Get 30 days from now for expected close date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const expectedCloseDate = futureDate.toISOString().split('T')[0];

    // Select a random contact if available and different from current
    const availableContacts = contacts.filter(c => (c._id || c.id) !== formData.contactId);
    const randomContact = availableContacts.length > 0 ? availableContacts[Math.floor(Math.random() * availableContacts.length)] : null;

    setFormData(prev => ({
      ...prev,
      title: 'Updated Enterprise Software License Deal',
      description: 'Enhanced software licensing agreement with additional modules and extended support coverage.',
      value: '35000',
      stage: 'negotiation',
      probability: '85',
      expectedCloseDate: expectedCloseDate,
      contactId: randomContact ? (randomContact._id || randomContact.id || '') : prev.contactId,
      company: randomContact?.company || 'Updated Acme Corporation',
      source: 'referral',
      dealType: 'upsell',
      priority: 'urgent',
      notes: 'Deal progressing well. Updated requirements received. Pricing negotiation in final stages. Strong commitment from decision maker.',
      tags: ['enterprise', 'software', 'upsell', 'urgent']
    }));

    // Clear any existing errors
    setErrors({});
    
    toast.success('Form auto-filled with updated sample data');
  };

  if (initialLoading) {
    return (
      <div className="space-y-6 max-w-full overflow-hidden">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Deal not found
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The deal you are trying to edit does not exist or has been deleted.
        </p>
        <Link href="/dashboard/deals" className="btn-primary">
          Back to Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/deals/${dealId}`}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-h1">Edit Deal</h1>
          <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
            Update deal information and details
          </p>
        </div>
        <button
          type="button"
          onClick={handleAutoFill}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Auto Fill
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter deal title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Deal Value *
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.value ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter deal description"
            />
          </div>
        </div>

        {/* Deal Details */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6">Deal Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Probability (%)
              </label>
              <input
                type="number"
                name="probability"
                value={formData.probability}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact and Company */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Contact & Company
            {contacts.length > 0 && (
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                ({contacts.length} contacts available)
              </span>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Contact *
              </label>
              <select
                name="contactId"
                value={formData.contactId}
                onChange={handleInputChange}
                disabled={contacts.length === 0}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.contactId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } ${contacts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {contacts.length === 0 ? 'Loading contacts...' : 'Select a contact'}
                </option>
                {contacts.map((contact) => (
                  <option key={contact._id || contact.id} value={contact._id || contact.id}>
                    {contact.firstName} {contact.lastName}
                    {contact.company ? ` (${contact.company})` : ''} - {contact.email}
                  </option>
                ))}
              </select>
              {errors.contactId && (
                <p className="mt-1 text-sm text-red-600">{errors.contactId}</p>
              )}
              {contacts.length === 0 && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    No contacts found. You need to create a contact first before editing this deal.
                  </p>
                  <Link 
                    href="/dashboard/contacts/new" 
                    className="inline-flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Create Contact
                  </Link>
                </div>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Company name (auto-filled from contact)"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Will be auto-filled when you select a contact with a company
              </p>
            </div>
          </div>
        </div>

        {/* Source and Type */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5" />
            Source & Type
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="referral">Referral</option>
                <option value="partner">Partner</option>
                <option value="marketing">Marketing</option>
                <option value="cold_call">Cold Call</option>
                <option value="website">Website</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Deal Type
              </label>
              <select
                name="dealType"
                value={formData.dealType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="new_business">New Business</option>
                <option value="existing_business">Existing Business</option>
                <option value="renewal">Renewal</option>
                <option value="upsell">Upsell</option>
                <option value="cross_sell">Cross Sell</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
              Expected Close Date *
            </label>
            <input
              type="date"
              name="expectedCloseDate"
              value={formData.expectedCloseDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.expectedCloseDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              }`}
            />
            {errors.expectedCloseDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expectedCloseDate}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6">Additional Information</h2>
          
          <div>
            <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Additional notes about this deal"
            />
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link href={`/dashboard/deals/${dealId}`} className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Updating...' : 'Update Deal'}
          </button>
        </div>
      </form>
    </div>
  );
} 