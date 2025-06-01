"use client";

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { 
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ContactsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ImportPreview {
  success: boolean;
  preview: boolean;
  parsing: {
    success: boolean;
    headers: string[];
    contacts: Record<string, unknown>[];
    totalRows: number;
  };
  validation: {
    validContacts: Record<string, unknown>[];
    invalidContacts: Record<string, unknown>[];
    duplicateEmails: string[];
  };
  summary: {
    totalRows: number;
    validContacts: number;
    invalidContacts: number;
    duplicateEmails: number;
  };
}

interface ImportResult {
  success: boolean;
  validation: {
    validContacts: Record<string, unknown>[];
    invalidContacts: Record<string, unknown>[];
    duplicateEmails: string[];
  };
  results: {
    imported: Record<string, unknown>[];
    skipped: Record<string, unknown>[];
    updated: Record<string, unknown>[];
    failed: Record<string, unknown>[];
  };
  summary: {
    total: number;
    valid: number;
    invalid: number;
    imported: number;
    skipped: number;
    updated: number;
    failed: number;
  };
}

export function ContactsImportModal({ isOpen, onClose, onImportComplete }: ContactsImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'options' | 'importing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import options
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    batchSize: 100
  });

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreview(null);
    setImportResult(null);
    setIsLoading(false);
    setDragActive(false);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      const response = await api.previewContactsImport(selectedFile);
      
      if (response.success) {
        setPreview(response.data as unknown as ImportPreview);
        setStep('preview');
      } else {
        throw new Error(response.error || 'Failed to preview import');
      }
    } catch (err) {
      console.error('Failed to preview import:', err);
      toast.error('Failed to preview import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      setStep('importing');
      setIsLoading(true);
      
      const response = await api.importContacts(selectedFile, importOptions);
      
      if (response.success) {
        const importData = response.data as unknown as ImportResult;
        setImportResult(importData);
        setStep('complete');
        toast.success(`Successfully imported ${importData.summary.imported} contacts`);
        onImportComplete();
      } else {
        throw new Error(response.error || 'Failed to import contacts');
      }
    } catch (err) {
      console.error('Failed to import contacts:', err);
      toast.error('Failed to import contacts');
      setStep('options');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const blob = await api.downloadContactsTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Template downloaded successfully');
    } catch (err) {
      console.error('Failed to download template:', err);
      toast.error('Failed to download template');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-h2">Import Contacts</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-body text-slate-600 dark:text-slate-300 mb-4">
                  Upload a CSV file to import your contacts. Make sure your file follows the correct format.
                </p>
                
                <button
                  onClick={downloadTemplate}
                  className="btn-secondary inline-flex items-center gap-2 mb-6"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  Download Template
                </button>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <ArrowUpTrayIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Supports CSV files up to 10MB
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Choose File
                </button>
              </div>

              {selectedFile && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Selected File</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={handlePreview}
                      disabled={isLoading}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isLoading ? 'Analyzing...' : 'Preview Import'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Import Preview</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Review the analysis of your CSV file before importing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {preview.summary.totalRows}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Rows</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {preview.summary.validContacts}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Valid Contacts</div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {preview.summary.invalidContacts}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Invalid Contacts</div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {preview.summary.duplicateEmails}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Duplicate Emails</div>
                </div>
              </div>

              {/* Headers Found */}
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">CSV Headers Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {preview.parsing.headers.map((header, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              {/* Validation Issues */}
              {preview.summary.invalidContacts > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900 dark:text-red-100">Validation Issues Found</h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {preview.summary.invalidContacts} contacts have validation errors and will be skipped during import.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setStep('upload')}
                  className="btn-secondary"
                >
                  Back
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('options')}
                    disabled={preview.summary.validContacts === 0}
                    className="btn-primary disabled:opacity-50"
                  >
                    Configure Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'options' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-h3 mb-4">Import Options</h3>
                <p className="text-body text-slate-600 dark:text-slate-300 mb-6">
                  Configure how you want to handle the import process.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Skip Duplicates</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Skip contacts with email addresses that already exist
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={importOptions.skipDuplicates}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Update Existing</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Update existing contacts with new information from CSV
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={importOptions.updateExisting}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <label className="block font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Batch Size
                  </label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Number of contacts to process at once (recommended: 100)
                  </p>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={importOptions.batchSize}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setStep('preview')}
                  className="btn-secondary"
                >
                  Back
                </button>
                
                <button
                  onClick={handleImport}
                  className="btn-primary"
                >
                  Start Import
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-h3 mb-2">Importing Contacts...</h3>
              <p className="text-body text-slate-600 dark:text-slate-300">
                Please wait while we process your contacts. This may take a few moments.
              </p>
            </div>
          )}

          {step === 'complete' && importResult && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-h3 mb-2">Import Complete!</h3>
                <p className="text-body text-slate-600 dark:text-slate-300">
                  Your contacts have been successfully imported.
                </p>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResult.summary.imported}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Imported</div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {importResult.summary.skipped}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Skipped</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {importResult.summary.updated}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Updated</div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResult.summary.failed}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleClose}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 