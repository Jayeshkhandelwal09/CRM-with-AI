'use client';

import React, { useState } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Moon,
  Sun,
  Monitor,
  Save
} from 'lucide-react';

function SettingsPage() {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    deals: true,
    contacts: true,
    ai: false,
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // TODO: Implement theme switching logic
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement settings save API call
    console.log('Saving settings:', { theme, notifications });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-near-white">Settings</h1>
            <p className="text-cool-grey mt-2">
              Customize your CRM experience and preferences
            </p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            className="bg-ice-blue hover:bg-ice-blue/80 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription className="text-cool-grey">
                Customize the look and feel of your CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-cool-grey mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className={`
                        flex flex-col items-center p-3 rounded-lg border transition-colors
                        ${theme === key 
                          ? 'border-ice-blue bg-ice-blue/10 text-ice-blue' 
                          : 'border-glass text-cool-grey hover:border-cool-grey'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-glass">
                <p className="text-sm text-cool-grey">
                  Note: Theme switching will be fully implemented in Phase 5
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription className="text-cool-grey">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                { key: 'deals', label: 'Deal Updates', description: 'Notifications for deal changes' },
                { key: 'contacts', label: 'Contact Updates', description: 'New contact notifications' },
                { key: 'ai', label: 'AI Insights', description: 'AI-generated insights and tips' },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-near-white text-sm font-medium">{label}</p>
                    <p className="text-cool-grey text-xs">{description}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key, !notifications[key as keyof typeof notifications])}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${notifications[key as keyof typeof notifications] ? 'bg-ice-blue' : 'bg-charcoal-glass'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-glass">
                <p className="text-sm text-cool-grey">
                  Notification system will be implemented in Phase 5
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security</span>
              </CardTitle>
              <CardDescription className="text-cool-grey">
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-cool-grey">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-cool-grey">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  className="glass-input"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-cool-grey">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="glass-input"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full glass-secondary text-cool-grey border-glass"
              >
                Change Password
              </Button>
              <div className="pt-4 border-t border-glass">
                <p className="text-sm text-cool-grey">
                  Password change functionality will be connected to backend API
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card className="glass-card border-glass">
            <CardHeader>
              <CardTitle className="text-ice-blue flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data & Privacy</span>
              </CardTitle>
              <CardDescription className="text-cool-grey">
                Manage your data and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full glass-secondary text-cool-grey border-glass"
                >
                  Export My Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full glass-secondary text-cool-grey border-glass"
                >
                  Download Activity Log
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full glass-secondary text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  Delete Account
                </Button>
              </div>
              <div className="pt-4 border-t border-glass">
                <p className="text-sm text-cool-grey">
                  Data management features will be implemented in Phase 5
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="glass-card border-glass">
          <CardHeader>
            <CardTitle className="text-ice-blue flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-cool-grey text-sm">Version</p>
                <p className="text-near-white font-medium">v1.0.0-beta</p>
              </div>
              <div>
                <p className="text-cool-grey text-sm">Last Updated</p>
                <p className="text-near-white font-medium">Phase 2 Complete</p>
              </div>
              <div>
                <p className="text-cool-grey text-sm">Environment</p>
                <p className="text-near-white font-medium">Development</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default withAuth(SettingsPage); 