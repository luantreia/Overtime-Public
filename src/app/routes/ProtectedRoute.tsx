import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../providers/AuthContext';
import { LoadingSpinner } from '../../shared/components';

interface ProtectedRouteProps { children: ReactNode }

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};

export default ProtectedRoute;