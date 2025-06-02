"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  contacts: "Contacts",
  deals: "Deals",
  analytics: "Analytics",
  ai: "AI Features",
  settings: "Settings",
};

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs for contact detail pages (they have custom breadcrumbs)
  if (pathname.match(/^\/contacts\/[^\/]+$/)) {
    return null;
  }

  // Don't show breadcrumbs for contact edit pages (they have custom breadcrumbs)
  if (pathname.match(/^\/contacts\/[^\/]+\/edit$/)) {
    return null;
  }

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    });

    // Build breadcrumbs from path segments
    let currentPath = "";
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;
      const fullPath = `/dashboard${currentPath}`;
      
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      breadcrumbs.push({
        label,
        href: fullPath,
        isActive: pathname === fullPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if we're just on the main dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <HomeIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-2" />
          )}
          
          {breadcrumb.isActive ? (
            <span className="text-slate-800 dark:text-slate-100 font-medium">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
} 