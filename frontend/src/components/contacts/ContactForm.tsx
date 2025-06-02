"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Contact } from '@/lib/api';
import { 
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  DocumentTextIcon,
  HomeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ContactFormProps {
  mode: 'create' | 'edit';
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  department: string;
  website: string;
  linkedinUrl: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'lead' | 'prospect' | 'customer' | 'active' | 'inactive' | '';
  leadSource: 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'advertisement' | 'other' | '';
  priority: 'low' | 'medium' | 'high' | 'urgent' | '';
  tags: string[];
  notes: string;
  description: string;
  preferences: {
    preferredContactMethod: 'email' | 'phone' | 'linkedin' | 'in_person' | '';
    timezone: string;
    doNotContact: boolean;
    emailOptOut: boolean;
  };
  nextFollowUpDate: string;
}

const initialFormData: ContactFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  department: '',
  website: '',
  linkedinUrl: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  status: '',
  leadSource: '',
  priority: '',
  tags: [],
  notes: '',
  description: '',
  preferences: {
    preferredContactMethod: '',
    timezone: '',
    doNotContact: false,
    emailOptOut: false,
  },
  nextFollowUpDate: '',
};

// Custom Breadcrumb Component for Contact Edit
function ContactEditBreadcrumb({ contact }: { contact: Contact | null }) {
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
      
      <Link
        href={`/contacts/${contact.id || contact._id}`}
        className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        {contact.firstName} {contact.lastName}
      </Link>
      
      <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      
      <span className="text-slate-800 dark:text-slate-100 font-medium">
        Edit
      </span>
    </nav>
  );
}

export function ContactForm({ mode }: ContactFormProps) {
  const router = useRouter();
  const params = useParams();
  const contactId = mode === 'edit' ? params.id as string : null;

  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const fetchContact = useCallback(async () => {
    if (!contactId) return;
    
    try {
      setIsLoading(true);
      const response = await api.getContact(contactId);
      
      if (response.success) {
        const contact = response.data;
        // Map _id to id for frontend compatibility
        const mappedContact = {
          ...contact,
          id: contact._id || contact.id
        };
        setFormData({
          firstName: mappedContact.firstName || '',
          lastName: mappedContact.lastName || '',
          email: mappedContact.email || '',
          phone: mappedContact.phone || '',
          company: mappedContact.company || '',
          jobTitle: mappedContact.jobTitle || '',
          department: mappedContact.department || '',
          website: mappedContact.website || '',
          linkedinUrl: mappedContact.linkedinUrl || '',
          address: {
            street: mappedContact.address?.street || '',
            city: mappedContact.address?.city || '',
            state: mappedContact.address?.state || '',
            zipCode: mappedContact.address?.zipCode || '',
            country: mappedContact.address?.country || '',
          },
          status: mappedContact.status || '',
          leadSource: mappedContact.leadSource || '',
          priority: mappedContact.priority || '',
          tags: mappedContact.tags || [],
          notes: mappedContact.notes || '',
          description: mappedContact.description || '',
          preferences: {
            preferredContactMethod: mappedContact.preferences?.preferredContactMethod || '',
            timezone: mappedContact.preferences?.timezone || '',
            doNotContact: mappedContact.preferences?.doNotContact || false,
            emailOptOut: mappedContact.preferences?.emailOptOut || false,
          },
          nextFollowUpDate: mappedContact.nextFollowUpDate ? mappedContact.nextFollowUpDate.split('T')[0] : '',
        });
        setContact(contact);
      } else {
        throw new Error(response.error || 'Failed to fetch contact');
      }
    } catch (err) {
      console.error('Failed to fetch contact:', err);
      toast.error('Failed to load contact');
      router.push('/contacts');
    } finally {
      setIsLoading(false);
    }
  }, [contactId, router]);

  useEffect(() => {
    if (mode === 'edit' && contactId) {
      fetchContact();
    }
  }, [mode, contactId, fetchContact]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, apostrophes, and periods';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email cannot exceed 100 characters';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)\.]{7,20}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL starting with http:// or https://';
    }

    if (formData.linkedinUrl && (!formData.linkedinUrl.includes('linkedin.com') || !/^https?:\/\/.+/.test(formData.linkedinUrl))) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL';
    }

    if (formData.company && formData.company.length > 100) {
      newErrors.company = 'Company name cannot exceed 100 characters';
    }

    if (formData.jobTitle && formData.jobTitle.length > 100) {
      newErrors.jobTitle = 'Job title cannot exceed 100 characters';
    }

    if (formData.department && formData.department.length > 100) {
      newErrors.department = 'Department cannot exceed 100 characters';
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes cannot exceed 2000 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.nextFollowUpDate) {
      const followUpDate = new Date(formData.nextFollowUpDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      if (followUpDate < today) {
        newErrors.nextFollowUpDate = 'Follow-up date cannot be in the past';
      }
    }

    // Validate timezone format
    if (formData.preferences.timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: formData.preferences.timezone });
      } catch (error) {
        newErrors.timezone = 'Please enter a valid timezone (e.g., America/New_York, Europe/London)';
      }
    }

    // Validate address fields length
    if (formData.address.street && formData.address.street.length > 200) {
      newErrors.street = 'Street address cannot exceed 200 characters';
    }
    if (formData.address.city && formData.address.city.length > 100) {
      newErrors.city = 'City cannot exceed 100 characters';
    }
    if (formData.address.state && formData.address.state.length > 100) {
      newErrors.state = 'State cannot exceed 100 characters';
    }
    if (formData.address.zipCode && formData.address.zipCode.length > 20) {
      newErrors.zipCode = 'Zip code cannot exceed 20 characters';
    }
    if (formData.address.country && formData.address.country.length > 100) {
      newErrors.country = 'Country cannot exceed 100 characters';
    }

    // Validate tags
    formData.tags.forEach((tag, index) => {
      if (tag.length > 50) {
        newErrors[`tag_${index}`] = `Tag "${tag}" cannot exceed 50 characters`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the data for submission
      const submitData: Partial<Contact> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.company.trim() || undefined,
        jobTitle: formData.jobTitle.trim() || undefined,
        department: formData.department.trim() || undefined,
        website: formData.website.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        address: Object.values(formData.address).some(v => v.trim()) ? {
          street: formData.address.street.trim() || undefined,
          city: formData.address.city.trim() || undefined,
          state: formData.address.state.trim() || undefined,
          zipCode: formData.address.zipCode.trim() || undefined,
          country: formData.address.country.trim() || undefined,
        } : undefined,
        status: formData.status || undefined,
        leadSource: formData.leadSource || undefined,
        priority: formData.priority || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        notes: formData.notes.trim() || undefined,
        description: formData.description.trim() || undefined,
        preferences: {
          preferredContactMethod: formData.preferences.preferredContactMethod || undefined,
          timezone: formData.preferences.timezone.trim() || undefined,
          doNotContact: formData.preferences.doNotContact,
          emailOptOut: formData.preferences.emailOptOut,
        },
        nextFollowUpDate: formData.nextFollowUpDate || undefined,
      };

      let response;
      if (mode === 'create') {
        response = await api.createContact(submitData);
      } else {
        response = await api.updateContact(contactId!, submitData);
      }

      if (response.success) {
        toast.success(`Contact ${mode === 'create' ? 'created' : 'updated'} successfully`);
        const contactId = response.data._id || response.data.id;
        router.push(`/contacts/${contactId}`);
      } else {
        throw new Error(response.error || `Failed to ${mode} contact`);
      }
    } catch (err) {
      console.error(`Failed to ${mode} contact:`, err);
      toast.error(`Failed to ${mode} contact`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePreferencesChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const fillRandomData = () => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const companies = ['Tech Solutions Inc', 'Digital Innovations LLC', 'Global Systems Corp', 'Future Tech Ltd', 'Smart Solutions', 'Data Dynamics', 'Cloud Computing Co', 'AI Ventures'];
    const jobTitles = ['Software Engineer', 'Product Manager', 'Sales Director', 'Marketing Specialist', 'Data Analyst', 'UX Designer', 'DevOps Engineer', 'Business Analyst'];
    const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'Human Resources', 'Product', 'Customer Success'];
    const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Boston', 'Seattle', 'Austin', 'Denver'];
    const states = ['California', 'New York', 'Texas', 'Illinois', 'Massachusetts', 'Washington', 'Colorado', 'Florida'];
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'India'];
    const timezones = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'America/Denver', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'];
    const leadSources: Array<'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'advertisement'> = ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'advertisement'];
    const priorities: Array<'low' | 'medium' | 'high' | 'urgent'> = ['low', 'medium', 'high', 'urgent'];
    const statuses: Array<'lead' | 'prospect' | 'customer' | 'active'> = ['lead', 'prospect', 'customer', 'active'];
    const contactMethods: Array<'email' | 'phone' | 'linkedin' | 'in_person'> = ['email', 'phone', 'linkedin', 'in_person'];
    const tagOptions = ['Developer', 'Manager', 'Enterprise', 'Startup', 'Tech', 'Sales', 'Marketing', 'VIP', 'Hot Lead', 'Follow Up'];

    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomState = states[Math.floor(Math.random() * states.length)];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    // Generate random tags (1-3 tags)
    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags: string[] = [];
    for (let i = 0; i < numTags; i++) {
      const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }

    const randomData: ContactFormData = {
      firstName: randomFirstName,
      lastName: randomLastName,
      email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}.${Date.now()}@example.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      company: randomCompany,
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      website: `https://${randomCompany.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
      linkedinUrl: `https://linkedin.com/in/${randomFirstName.toLowerCase()}${randomLastName.toLowerCase()}`,
      address: {
        street: `${Math.floor(Math.random() * 9999) + 1} ${['Main', 'Oak', 'Pine', 'Elm', 'Cedar', 'Maple'][Math.floor(Math.random() * 6)]} Street`,
        city: randomCity,
        state: randomState,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: randomCountry,
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      leadSource: leadSources[Math.floor(Math.random() * leadSources.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      tags: selectedTags,
      notes: `Sample contact for ${randomCompany}. Generated for testing purposes.`,
      description: `${randomFirstName} ${randomLastName} is a ${jobTitles[Math.floor(Math.random() * jobTitles.length)]} at ${randomCompany}.`,
      preferences: {
        preferredContactMethod: contactMethods[Math.floor(Math.random() * contactMethods.length)],
        timezone: timezones[Math.floor(Math.random() * timezones.length)],
        doNotContact: Math.random() < 0.1, // 10% chance
        emailOptOut: Math.random() < 0.05, // 5% chance
      },
      nextFollowUpDate: new Date(Date.now() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1-30 days from now
    };

    setFormData(randomData);
    setErrors({});
    toast.success(`Random data filled for ${randomFirstName} ${randomLastName}!`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="glass-card animate-pulse">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Breadcrumb for Edit Mode */}
      {mode === 'edit' && contact && (
        <ContactEditBreadcrumb contact={contact} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/contacts"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          
          <div>
            <h1 className="text-h1">
              {mode === 'create' ? 'Add New Contact' : 'Edit Contact'}
            </h1>
            <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
              {mode === 'create' 
                ? 'Create a new contact in your CRM'
                : 'Update contact information'
              }
            </p>
          </div>
        </div>

        {/* Fill Random Data Button - Only show in create mode */}
        {mode === 'create' && (
          <button
            type="button"
            onClick={fillRandomData}
            className="btn-secondary flex items-center gap-2"
          >
            <UserIcon className="w-4 h-4" />
            Fill Random Data
          </button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <BuildingOfficeIcon className="w-5 h-5" />
            Company Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.company ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.jobTitle ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter job title"
              />
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.department ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter department"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.website ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.linkedinUrl ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="https://linkedin.com/in/username"
              />
              {errors.linkedinUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.linkedinUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            Address
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.street ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter street address"
              />
              {errors.street && (
                <p className="mt-1 text-sm text-red-600">{errors.street}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.city ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.state ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter state or province"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.zipCode ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter ZIP or postal code"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.country ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter country"
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
              )}
            </div>
          </div>
        </div>

        {/* Status & Classification */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6">Status & Classification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select status</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="customer">Customer</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Lead Source
              </label>
              <select
                value={formData.leadSource}
                onChange={(e) => handleInputChange('leadSource', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="cold_call">Cold Call</option>
                <option value="event">Event</option>
                <option value="advertisement">Advertisement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Tags
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary"
              >
                Add Tag
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes & Description */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Notes & Description
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                  errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter a brief description of the contact"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                  errors.notes ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Enter any additional notes about the contact"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Preferences & Follow-up */}
        <div className="glass-card">
          <h2 className="text-h2 mb-6 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Preferences & Follow-up
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Preferred Contact Method
              </label>
              <select
                value={formData.preferences.preferredContactMethod}
                onChange={(e) => handlePreferencesChange('preferredContactMethod', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Select method</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="linkedin">LinkedIn</option>
                <option value="in_person">In Person</option>
              </select>
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Timezone
              </label>
              <input
                type="text"
                value={formData.preferences.timezone}
                onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.timezone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="e.g., America/New_York, Europe/London"
              />
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>
              )}
            </div>

            <div>
              <label className="block text-label text-slate-700 dark:text-slate-300 mb-2">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={formData.nextFollowUpDate}
                onChange={(e) => handleInputChange('nextFollowUpDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.nextFollowUpDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              />
              {errors.nextFollowUpDate && (
                <p className="mt-1 text-sm text-red-600">{errors.nextFollowUpDate}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="doNotContact"
                  checked={formData.preferences.doNotContact}
                  onChange={(e) => handlePreferencesChange('doNotContact', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                />
                <label htmlFor="doNotContact" className="ml-2 text-label text-slate-700 dark:text-slate-300">
                  Do not contact
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailOptOut"
                  checked={formData.preferences.emailOptOut}
                  onChange={(e) => handlePreferencesChange('emailOptOut', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                />
                <label htmlFor="emailOptOut" className="ml-2 text-label text-slate-700 dark:text-slate-300">
                  Email opt-out
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Link
            href="/contacts"
            className="btn-secondary"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Contact' : 'Update Contact')
            }
          </button>
        </div>
      </form>
    </div>
  );
} 