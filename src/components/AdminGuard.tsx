import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-tech text-accent">
        SYNCHRONIZING_CORE...
      </div>
    );
  }

  // If not logged in, we allow them to proceed to /admin so they can see the LoginView
  if (!user) {
    return <>{children}</>;
  }

  if (!isAdmin) {
    // If the user is the bootstrap user, we allow them to see the Admin page
    // so they can click the bootstrap button.
    const bootstrapEmail = 'fffg3839@gmail.com'; // Matches Admin.tsx
    if (user.email === bootstrapEmail) {
      return <>{children}</>;
    }
    
    // For any other logged-in non-admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
