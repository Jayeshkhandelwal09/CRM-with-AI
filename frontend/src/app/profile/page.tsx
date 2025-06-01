'use client';

import React, { useState } from 'react';
import { withAuth, useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Building, Users, Calendar, Shield, Edit, Save, X } from 'lucide-react';

function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    company: user?.company || '',
    department: user?.department || '',
    role: user?.role || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // TODO: Implement profile update API call
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      company: user?.company || '',
      department: user?.department || '',
      role: user?.role || '',
    });
    setIsEditing(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-near-white">Profile</h1>
            <p className="text-cool-grey mt-2">
              Manage your account information and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-ice-blue hover:bg-ice-blue/80 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="glass-secondary text-cool-grey border-glass"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-glass">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription className="text-cool-grey">
                  Your basic account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-cool-grey">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-cool-grey">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-cool-grey">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="glass-input"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Organization Information</span>
                </CardTitle>
                <CardDescription className="text-cool-grey">
                  Your company and role details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company" className="text-cool-grey">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="glass-input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department" className="text-cool-grey">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-cool-grey">Role</Label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="glass-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Status & Stats */}
          <div className="space-y-6">
            <Card className="glass-card border-glass">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cool-grey">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {user?.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cool-grey">Email Verified</span>
                  <span className={user?.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                    {user?.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cool-grey">Member Since</span>
                  <span className="text-near-white text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>AI Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cool-grey">Daily Requests</span>
                    <span className="text-near-white">
                      {user?.aiRequestsUsed} / {user?.aiRequestsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-charcoal-glass rounded-full h-2">
                    <div
                      className="bg-ice-blue h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((user?.aiRequestsUsed || 0) / (user?.aiRequestsLimit || 100)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-cool-grey">
                  Resets daily at midnight
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass">
              <CardHeader>
                <CardTitle className="text-ice-blue flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-cool-grey">Total Contacts</span>
                  <span className="text-near-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cool-grey">Active Deals</span>
                  <span className="text-near-white font-medium">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cool-grey">This Month</span>
                  <span className="text-near-white font-medium">$0</span>
                </div>
                <p className="text-xs text-cool-grey pt-2 border-t border-glass">
                  Stats will be available once you start using the CRM
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default withAuth(ProfilePage); 