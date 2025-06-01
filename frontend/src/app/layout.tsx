import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PageErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Toaster } from "sonner";

// Font configurations as per frontend design specs
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRM AI - AI-Powered Customer Relationship Management",
  description: "Modern CRM with AI-powered features for sales teams. Manage contacts, deals, and get intelligent insights.",
  keywords: ["CRM", "AI", "Sales", "Customer Management", "Deal Pipeline"],
  authors: [{ name: "CRM AI Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6", // Primary blue from design specs
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto.variable}`}>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100`}>
        <PageErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </PageErrorBoundary>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  );
}
