import { useQuery } from '@tanstack/react-query';
async function fetchDashboardData(forceSync = false) {
  const res = await fetch(`/api/dashboard${forceSync ? '?sync=true' : ''}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}
export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: () => fetchDashboardData(false), refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 });
}
