"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { Bars3Icon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { GlobalSearch } from '@/components/dashboard/GlobalSearch';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    toast.info('Signing out...', {
      description: 'You have been successfully signed out.',
    });
    logout();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex items-center px-4 lg:px-6">
      {/* Left side - Mobile menu button + Logo (only when sidebar collapsed) + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        
        {/* Show CRM AI logo only when sidebar is collapsed on desktop */}
        {sidebarCollapsed && (
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-h3 font-semibold text-slate-800 dark:text-slate-100">CRM AI</span>
          </div>
        )}

        {/* Global Search - positioned based on sidebar state */}
        <div className={`w-1/2 transition-all duration-300 ${
          sidebarCollapsed 
            ? 'ml-4' // When collapsed, add margin from logo
            : 'ml-0' // When expanded, start from left edge
        }`}>
          <GlobalSearch />
        </div>
      </div>

      {/* Right side - Theme toggle + User menu */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <SunIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
          
          {/* Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm cursor-pointer hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {getInitials(user?.firstName, user?.lastName)}
            </button>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl transition-all duration-200 z-[60] ${
              isDropdownOpen 
                ? 'opacity-100 visible transform translate-y-0' 
                : 'opacity-0 invisible transform -translate-y-2'
            }`}>
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
              
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}