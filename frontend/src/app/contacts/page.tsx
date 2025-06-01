'use client';

import React from 'react';
import { withAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Search, Filter } from 'lucide-react';

function ContactsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-near-white">Contacts</h1>
            <p className="text-cool-grey mt-2">
              Manage your customer relationships and contact information
            </p>
          </div>
          <Button className="bg-ice-blue hover:bg-ice-blue/80 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="glass-secondary text-cool-grey border-glass">
            <Search className="h-4 w-4 mr-2" />
            Search Contacts
          </Button>
          <Button variant="outline" className="glass-secondary text-cool-grey border-glass">
            <Filter className="h-4 w-4 mr-2" />
            Filter & Sort
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="glass-card border-glass">
          <CardHeader>
            <CardTitle className="text-ice-blue flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Contacts Management</span>
            </CardTitle>
            <CardDescription className="text-cool-grey">
              Full contacts functionality will be available in Phase 3
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-cool-grey">
              <h3 className="text-near-white font-medium mb-2">Coming Features:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Contact list with search and filtering</li>
                <li>• Contact detail pages with interaction history</li>
                <li>• Add/edit contact forms</li>
                <li>• Contact import/export functionality</li>
                <li>• Tags and categorization</li>
                <li>• Associated deals tracking</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-glass">
              <p className="text-sm text-cool-grey">
                This page will be fully implemented in Phase 3 of the development roadmap.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default withAuth(ContactsPage); 