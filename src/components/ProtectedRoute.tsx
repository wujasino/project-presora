import { Navigate, useLocation } from 'react-router-dom';
import { useSessionUser } from '@/hooks/useAccountInfo';
import { isSigningOut } from '@/lib/auth';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Cached by react-query — every protected route wraps its own instance of
  // this guard, so without a shared cache the whole page (sidebar included)
  // would blank out to "Loading..." on every single navigation while it
  // re-checked a session it already knew about.
  const { data: sessionUser, isLoading, error } = useSessionUser();
  const isAuthenticated = !!sessionUser?.email;
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-500 mb-2">Configuration error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : String(error)}</p>
          <p className="text-xs text-muted-foreground">Sprawdź plik <code className="bg-secondary p-1 rounded">.env</code></p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Two guards against a real, observed race with AppNavbar's sign-out
    // handler (session-user cache clears synchronously mid-signOut, well
    // before the handler's own navigate('/') call resolves):
    //  1. isSigningOut() covers the window before any navigate() has
    //     happened at all.
    //  2. Once navigate() has happened, the browser's real location can
    //     diverge from what this component's own useLocation() still
    //     reports — a stale re-render of the outgoing route, forced by the
    //     same cache-clear, arriving after the browser already moved on but
    //     before React has reconciled this subtree away. Firing our own
    //     redirect on that stale render would clobber the real destination.
    if (isSigningOut() || location.pathname !== window.location.pathname) return null;
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
