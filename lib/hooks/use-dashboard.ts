import { useQuery } from '@tanstack/react-query';
async function fetchDashboardData(forceSync = false, channelId?: string) {
  const params = new URLSearchParams();
  if (forceSync) params.set('sync', 'true');
  if (channelId) params.set('channelId', channelId);
  const res = await fetch(`/api/dashboard?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
export function useDashboard(channelId?: string) {
  return useQuery({ queryKey: ['dashboard', channelId], queryFn: () => fetchDashboardData(false, channelId), refetchOnWindowFocus: true, staleTime: 1000 * 30, refetchInterval: 1000 * 60 * 2 });
}
