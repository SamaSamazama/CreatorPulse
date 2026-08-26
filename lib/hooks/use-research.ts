import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export function useCompetitors() {
  return useQuery({ queryKey: ['competitors'], queryFn: async () => { const res = await fetch('/api/research/competitors'); return res.json(); } });
}
export function useAddCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (channelIdentifier: string) => {
      const res = await fetch('/api/research/competitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelIdentifier }) });
      if (!res.ok) throw new Error('Failed'); return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitors'] }),
  });
}
export function useKeywordResearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch('/api/research/keywords', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      if (!res.ok) throw new Error('Failed'); return res.json();
    },
  });
}
