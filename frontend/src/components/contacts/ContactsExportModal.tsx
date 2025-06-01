"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { 
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ContactsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: {
    search?: string;
    company?: string;
    tags?: string;
    status?: string;
  };
}

interface ExportField {
  key: string;
  label: string;
  description: string;
  category: 'basic' | 'contact' | 'company' | 'address' | 'preferences' | 'metadata';
}

const EXPORT_FIELDS: ExportField[] = [
  // Basic Information
  { key: 'firstName', label: 'First Name', description: 'Contact\'s first name', category: 'basic' },
  { key: 'lastName', label: 'Last Name', description: 'Contact\'s last name', category: 'basic' },
  { key: 'email', label: 'Email', description: 'Primary email address', category: 'basic' },
  { key: 'phone', label: 'Phone', description: 'Primary phone number', category: 'basic' },
  
  // Contact Information
  { key: 'status', label: 'Status', description: 'Contact status (lead, prospect, customer, etc.)', category: 'contact' },
  { key: 'priority', label: 'Priority', description: 'Contact priority level', category: 'contact' },
  { key: 'leadSource', label: 'Lead Source', description: 'How the contact was acquired', category: 'contact' },
  { key: 'tags', label: 'Tags', description: 'Contact tags (comma-separated)', category: 'contact' },
  { key: 'notes', label: 'Notes', description: 'Contact notes', category: 'contact' },
  { key: 'description', label: 'Description', description: 'Contact description', category: 'contact' },
  
  // Company Information
  { key: 'company', label: 'Company', description: 'Company name', category: 'company' },
  { key: 'jobTitle', label: 'Job Title', description: 'Contact\'s job title', category: 'company' },
  { key: 'department', label: 'Department', description: 'Department within company', category: 'company' },
  { key: 'website', label: 'Website', description: 'Company website', category: 'company' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', description: 'LinkedIn profile URL', category: 'company' },
  
  // Address Information
  { key: 'street', label: 'Street Address', description: 'Street address', category: 'address' },
  { key: 'city', label: 'City', description: 'City', category: 'address' },
  { key: 'state', label: 'State/Province', description: 'State or province', category: 'address' },
  { key: 'zipCode', label: 'ZIP/Postal Code', description: 'ZIP or postal code', category: 'address' },
  { key: 'country', label: 'Country', description: 'Country', category: 'address' },
  
  // Preferences
  { key: 'preferredContactMethod', label: 'Preferred Contact Method', description: 'How they prefer to be contacted', category: 'preferences' },
  { key: 'timezone', label: 'Timezone', description: 'Contact\'s timezone', category: 'preferences' },
  { key: 'doNotContact', label: 'Do Not Contact', description: 'Whether contact has opted out', category: 'preferences' },
  { key: 'emailOptOut', label: 'Email Opt-out', description: 'Whether contact has opted out of emails', category: 'preferences' },
  
  // Metadata
  { key: 'lastContactDate', label: 'Last Contact Date', description: 'Date of last interaction', category: 'metadata' },
  { key: 'nextFollowUpDate', label: 'Next Follow-up Date', description: 'Scheduled follow-up date', category: 'metadata' },
  { key: 'interactionCount', label: 'Interaction Count', description: 'Total number of interactions', category: 'metadata' },
  { key: 'createdAt', label: 'Created Date', description: 'When contact was created', category: 'metadata' },
  { key: 'updatedAt', label: 'Updated Date', description: 'When contact was last updated', category: 'metadata' },
];

const DEFAULT_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'status'];

export function ContactsExportModal({ isOpen, onClose, currentFilters }: ContactsExportModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(DEFAULT_FIELDS);
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    dateFormat: 'YYYY-MM-DD',
    delimiter: ','
  });
  const [isExporting, setIsExporting] = useState(false);
  const [useCurrentFilters, setUseCurrentFilters] = useState(true);

  const handleClose = () => {
    setSelectedFields(DEFAULT_FIELDS);
    setExportOptions({
      includeHeaders: true,
      dateFormat: 'YYYY-MM-DD',
      delimiter: ','
    });
    setIsExporting(false);
    setUseCurrentFilters(true);
    onClose();
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(EXPORT_FIELDS.map(f => f.key));
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const handleSelectDefaults = () => {
    setSelectedFields(DEFAULT_FIELDS);
  };

  const handleSelectCategory = (category: string) => {
    const categoryFields = EXPORT_FIELDS.filter(f => f.category === category).map(f => f.key);
    const allSelected = categoryFields.every(field => selectedFields.includes(field));
    
    if (allSelected) {
      // Deselect all fields in this category
      setSelectedFields(prev => prev.filter(field => !categoryFields.includes(field)));
    } else {
      // Select all fields in this category
      setSelectedFields(prev => [...new Set([...prev, ...categoryFields])]);
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    try {
      setIsExporting(true);
      
      const exportFilters = useCurrentFilters ? currentFilters : {};
      
      // Convert tags string to array if needed
      const processedFilters = exportFilters ? {
        ...exportFilters,
        tags: exportFilters.tags ? [exportFilters.tags] : undefined
      } : {};
      
      const blob = await api.exportContacts({
        fields: selectedFields,
        ...processedFilters,
        includeHeaders: exportOptions.includeHeaders,
        dateFormat: exportOptions.dateFormat,
        delimiter: exportOptions.delimiter
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Contacts exported successfully');
      handleClose();
    } catch (err) {
      console.error('Failed to export contacts:', err);
      toast.error('Failed to export contacts');
    } finally {
      setIsExporting(false);
    }
  };

  const groupedFields = EXPORT_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  const categoryLabels = {
    basic: 'Basic Information',
    contact: 'Contact Details',
    company: 'Company Information',
    address: 'Address',
    preferences: 'Preferences',
    metadata: 'Metadata'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-h2">Export Contacts</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <h3 className="text-h3">Export Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includeHeaders"
                      checked={exportOptions.includeHeaders}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeHeaders: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="includeHeaders" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Include column headers
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="useCurrentFilters"
                      checked={useCurrentFilters}
                      onChange={(e) => setUseCurrentFilters(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="useCurrentFilters" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                      Use current filters
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date Format
                    </label>
                    <select
                      value={exportOptions.dateFormat}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, dateFormat: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Delimiter
                    </label>
                    <select
                      value={exportOptions.delimiter}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="\t">Tab</option>
                    </select>
                  </div>
                </div>
              </div>

              {useCurrentFilters && currentFilters && Object.keys(currentFilters).length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Current filters will be applied:</strong>
                    {currentFilters.search && ` Search: "${currentFilters.search}"`}
                    {currentFilters.company && ` Company: "${currentFilters.company}"`}
                    {currentFilters.tags && ` Tags: "${currentFilters.tags}"`}
                    {currentFilters.status && ` Status: "${currentFilters.status}"`}
                  </p>
                </div>
              )}
            </div>

            {/* Field Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-h3">Select Fields to Export</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectDefaults}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Defaults
                  </button>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleSelectNone}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Select None
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400">
                {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
              </div>

              {/* Field Categories */}
              <div className="space-y-4">
                {Object.entries(groupedFields).map(([category, fields]) => {
                  const categorySelected = fields.filter(f => selectedFields.includes(f.key)).length;
                  const categoryTotal = fields.length;
                  const allSelected = categorySelected === categoryTotal;
                  const someSelected = categorySelected > 0 && categorySelected < categoryTotal;

                  return (
                    <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div 
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 cursor-pointer"
                        onClick={() => handleSelectCategory(category)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              ref={(el) => {
                                if (el) el.indeterminate = someSelected;
                              }}
                              onChange={() => {}} // Handled by onClick
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                          </div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {categoryLabels[category as keyof typeof categoryLabels]}
                          </h4>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {categorySelected}/{categoryTotal}
                        </span>
                      </div>
                      
                      <div className="p-3 space-y-2">
                        {fields.map((field) => (
                          <div key={field.key} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={field.key}
                              checked={selectedFields.includes(field.key)}
                              onChange={() => handleFieldToggle(field.key)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <label 
                                htmlFor={field.key}
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                {field.label}
                              </label>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {field.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Contacts'}
          </button>
        </div>
      </div>
    </div>
  );
} 