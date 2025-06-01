'use client';

import React from 'react';
import { withAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, BarChart3, Kanban } from 'lucide-react';

function DealsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-near-white">Deals</h1>
            <p className="text-cool-grey mt-2">
              Track your sales pipeline and manage deal progression
            </p>
          </div>
          <Button className="bg-ice-blue hover:bg-ice-blue/80 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>

        {/* View Options */}
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="glass-secondary text-cool-grey border-glass">
            <Kanban className="h-4 w-4 mr-2" />
            Pipeline View
          </Button>
          <Button variant="outline" className="glass-secondary text-cool-grey border-glass">
            <BarChart3 className="h-4 w-4 mr-2" />
            List View
          </Button>
        </div>

        {/* Coming Soon Card */}
        <Card className="glass-card border-glass">
          <CardHeader>
            <CardTitle className="text-ice-blue flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <span>Deals Management</span>
            </CardTitle>
            <CardDescription className="text-cool-grey">
              Full deals functionality will be available in Phase 3
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-cool-grey">
              <h3 className="text-near-white font-medium mb-2">Coming Features:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Kanban-style pipeline board with drag-and-drop</li>
                <li>• Deal detail pages with activity timeline</li>
                <li>• Add/edit deal forms with contact association</li>
                <li>• Deal progression tracking and stage management</li>
                <li>• Revenue forecasting and analytics</li>
                <li>• Deal probability scoring</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-glass">
              <p className="text-sm text-cool-grey">
                This page will be fully implemented in Phase 3 of the development roadmap.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['Lead', 'Qualified', 'Proposal', 'Closed'].map((stage, index) => (
            <Card key={stage} className="glass-card border-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-ice-blue text-sm font-medium">{stage}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-cool-grey">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Coming in Phase 3</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default withAuth(DealsPage); 