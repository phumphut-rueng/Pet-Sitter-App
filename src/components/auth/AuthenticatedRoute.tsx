import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthenticatedRoute({
  children,
  redirectTo = '/'
}: AuthenticatedRouteProps) {
  const { isAuthenticated, state } = useAuth();
  const { loading } = state;
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect them away from auth pages
    if (!loading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, loading, router, redirectTo]);

  // Show loading while checking authentication
  if (loading === null || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render children (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // User is not authenticated, show the auth page
  return <>{children}</>;
}