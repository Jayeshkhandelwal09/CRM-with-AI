"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContactForm } from "@/components/contacts/ContactForm";

export default function EditContactPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContactForm mode="edit" />
      </DashboardLayout>
    </ProtectedRoute>
  );
} 