import { useQuery, useQueryClient } from '@tanstack/react-query';
async function fetchDashboardData(forceSync = false, channelId?: string) {
  const params = new URLSearchParams();
  if (forceSync) params.set('sync', 'true');
  if (channelId) params.set('channelId', channelId);
  const res = await fetch(`/api/dashboard?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMessage = data?.error || data?.details || 'Failed to fetch dashboard';
    if (errorMessage.includes('YOUTUBE_TOKEN_INVALID') || errorMessage.includes('invalid_grant')) {
      throw new Error('YOUTUBE_TOKEN_INVALID');
    }
    throw new Error(errorMessage);
  }
  return res.json();
}
export function useDashboard(channelId?: string) {
  return useQuery({
    queryKey: ['dashboard', channelId],
    queryFn: () => fetchDashboardData(false, channelId),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60 * 2,
  });
}
export function useSyncDashboard() {
  const queryClient = useQueryClient();
  return async (channelId?: string) => {
    await fetch(`/api/dashboard?${new URLSearchParams({ sync: 'true', ...(channelId ? { channelId } : {}) })}`);
    await queryClient.invalidateQueries({ queryKey: ['dashboard', channelId] });
  };
}
