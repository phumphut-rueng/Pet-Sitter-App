import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, state } = useAuth();
  const { user, loading } = state;
  const router = useRouter();

  useEffect(() => {
    if (loading === null || loading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      router.replace(fallbackPath);
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      if (!user?.roles) {
        router.replace('/');
        return;
      }
      const hasRequiredRole = requiredRoles.some(role => user.roles!.includes(role));
      if (!hasRequiredRole) {
        router.replace('/');
        return;
      }
    }
  }, [isAuthenticated, loading, user, requireAuth, requiredRoles, router, fallbackPath]);

  if (loading === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0) {
    if (!user?.roles) {
      return null;
    }
    const hasRequiredRole = requiredRoles.some(role => user.roles!.includes(role));
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}