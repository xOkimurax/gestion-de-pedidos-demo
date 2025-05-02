import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export const ProtectedRoute: React.FC = () => {
  const { isLoggedIn } = useStore();

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // If logged in, render the child routes inside the admin layout
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};