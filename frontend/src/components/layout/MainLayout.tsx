import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  Users, 
  Briefcase, 
  User, 
  Settings, 
  Menu, 
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/dashboard' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const navItem = navigation.find(nav => nav.href === currentPath);
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href: currentPath });
      } else {
        // Capitalize first letter for dynamic routes
        const name = path.charAt(0).toUpperCase() + path.slice(1);
        breadcrumbs.push({ name, href: currentPath });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex h-screen bg-gradient-to-br from-charcoal-glass to-slate-900 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full bg-white bg-opacity-8 backdrop-blur-lg border-r border-ice-blue border-opacity-10">
          {/* Logo/Brand - Consistent with login/register */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-ice-blue border-opacity-8">
            <Link href="/dashboard" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
              <div className="w-10 h-10 bg-ice-blue rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🤖</span>
              </div>
              <div className="flex flex-col">
                <span className="text-near-white font-bold text-lg leading-tight">AI-Powered  <span className="text-ice-blue font-semibold text-md leading-tight">CRM</span></span>
               
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-cool-grey hover:text-near-white hover:bg-ice-blue hover:bg-opacity-10 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out
                    ${isActive 
                      ? 'bg-ice-blue bg-opacity-20 text-ice-blue border border-ice-blue border-opacity-30 shadow-lg shadow-ice-blue/10' 
                      : 'text-cool-grey hover:text-near-white hover:bg-ice-blue hover:bg-opacity-8 hover:backdrop-blur-sm'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-ice-blue border-opacity-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-purple to-ice-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-near-white text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-cool-grey text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full glass-secondary text-soft-purple border-soft-purple hover:text-white hover:bg-soft-purple hover:bg-opacity-20 hover:border-opacity-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top navigation bar - Perfectly aligned with sidebar */}
        <header className="h-16 bg-white bg-opacity-8 backdrop-blur-lg border-b border-ice-blue border-opacity-8 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-cool-grey hover:text-near-white hover:bg-ice-blue hover:bg-opacity-10 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-cool-grey" />
                )}
                <Link
                  href={breadcrumb.href}
                  className={`
                    transition-colors duration-200
                    ${index === breadcrumbs.length - 1
                      ? 'text-near-white font-medium'
                      : 'text-cool-grey hover:text-ice-blue'
                    }
                  `}
                >
                  {breadcrumb.name}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          {/* Right side - Enhanced user info display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-ice-blue to-soft-purple rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-near-white text-sm font-semibold">
                  {user?.firstName} {user?.lastName} ({user?.role})
                </p>
                {/* <p className="text-ice-blue text-xs font-medium uppercase tracking-wide">{user?.role}</p> */}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 