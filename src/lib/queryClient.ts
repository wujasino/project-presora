import { QueryCache, QueryClient } from '@tanstack/react-query';

// Tracked outside React (a plain module-level pub-sub) so any component can
// read "is the backend actually reachable right now" without prop-drilling
// it down from wherever the failing query lives — flipped by the
// QueryCache's global onError/onSuccess below, not tied to one query.
//
// Most queryFns in this codebase already swallow Supabase's own {error}
// responses and fail open with a default value (see fetchProfileFlags,
// useScanStatus, etc.) — a query actually throwing up to here is a strong
// signal of real connectivity failure (network down, Supabase unreachable),
// not a normal "not found"/RLS-denied case, which are handled as component
// state elsewhere (see loadStoredAnalysis's notFound handling) rather than
// as a thrown react-query error.
type BackendHealthListener = (healthy: boolean) => void;
const healthListeners = new Set<BackendHealthListener>();
let backendHealthy = true;

const setBackendHealthy = (healthy: boolean) => {
  if (backendHealthy === healthy) return;
  backendHealthy = healthy;
  healthListeners.forEach(listener => listener(healthy));
};

export const subscribeBackendHealth = (listener: BackendHealthListener) => {
  healthListeners.add(listener);
  return () => { healthListeners.delete(listener); };
};

export const getBackendHealthy = () => backendHealthy;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => setBackendHealthy(false),
    onSuccess: () => setBackendHealthy(true),
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

// A localStorage-persisted query cache (read-only offline mode) was tried
// here and reverted — PersistQueryClientProvider's restore step made
// ProtectedRoute (components/ProtectedRoute.tsx) treat a stale/absent
// restored session-user query as "already loaded: signed out" before
// supabase.auth.onAuthStateChange's real check ran, intermittently bouncing
// genuinely signed-in users to /login. Confirmed by bisecting the e2e
// suite: reverting just this provider (keeping the health-tracking above)
// fixed all 10 failures. Re-attempt only with a restore-side filter that
// actually prevents ProtectedRoute from ever seeing a restored value for
// session-user/profile-flags, not just a dehydrate-side one.
