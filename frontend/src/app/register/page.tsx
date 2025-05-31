'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name cannot exceed 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  company: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name cannot exceed 100 characters'),
  role: z.enum(['SDR', 'AE', 'Manager', 'Admin']),
  department: z.string().max(50, 'Department cannot exceed 50 characters').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'SDR', label: 'SDR (Sales Development Rep)' },
  { value: 'AE', label: 'AE (Account Executive)' },
  { value: 'Manager', label: 'Sales Manager' },
  { value: 'Admin', label: 'Administrator' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'SDR',
      department: '',
    },
  });

  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      // Remove empty department field
      if (!registerData.department) {
        delete registerData.department;
      }
      
      await registerUser(registerData);
      
      // Redirect to dashboard on successful registration
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-glass to-slate-900">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ice-blue mx-auto"></div>
          <p className="text-cool-grey mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-glass to-slate-900 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-ice-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🤖</span>
            </div>
            <h1 className="text-2xl font-bold text-ice-blue">AI-Powered CRM</h1>
          </div>
          <p className="text-cool-grey">Create your account to get started with AI-powered sales.</p>
        </div>

        {/* Registration Form */}
        <Card className="glass-card border-glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-near-white">Create Account</CardTitle>
            <CardDescription className="text-cool-grey">
              Fill in your details to create your AI-CRM account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-cool-grey">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="glass-input"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-cool-grey">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="glass-input"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cool-grey">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  className="glass-input"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Company Field */}
              <div className="space-y-2">
                <Label htmlFor="company" className="text-cool-grey">
                  Company Name
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your Company Inc."
                  className="glass-input"
                  {...register('company')}
                />
                {errors.company && (
                  <p className="text-red-400 text-sm">{errors.company.message}</p>
                )}
              </div>

              {/* Role and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-cool-grey">
                    Role
                  </Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="glass-input">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && (
                    <p className="text-red-400 text-sm">{errors.role.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-cool-grey">
                    Department <span className="text-xs text-cool-grey/70">(Optional)</span>
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Sales"
                    className="glass-input"
                    {...register('department')}
                  />
                  {errors.department && (
                    <p className="text-red-400 text-sm">{errors.department.message}</p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cool-grey">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    className="glass-input"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password.message}</p>
                  )}
                  {/* Password Requirements */}
                  {password && (
                    <div className="glass-card p-3 mt-2 border-glass">
                      <p className="text-xs text-cool-grey mb-2 font-medium">Password Requirements:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                        <p className={password.length >= 8 ? 'text-green-400' : 'text-red-400'}>
                          ✓ At least 8 characters
                        </p>
                        <p className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                          ✓ One uppercase letter
                        </p>
                        <p className={/[a-z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                          ✓ One lowercase letter
                        </p>
                        <p className={/\d/.test(password) ? 'text-green-400' : 'text-red-400'}>
                          ✓ One number
                        </p>
                        <p className={/[@$!%*?&]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                          ✓ One special character
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-cool-grey">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="glass-input"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full glass-button text-white py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-cool-grey text-sm">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-ice-blue hover:text-soft-purple transition-colors font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 