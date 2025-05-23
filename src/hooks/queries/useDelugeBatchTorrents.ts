'use client';

import { fetchTorrent } from '@/queries/deluge';
import { useQueries } from '@tanstack/react-query';

export function useDelugeBatchTorrents(torrentIds: string[]) {
  return useQueries({
    queries: torrentIds.map((id) => ({
      queryKey: ['torrent', id],
      queryFn: () => fetchTorrent(id),
      refetchInterval: 1000 * 20, // 10 seconds
    })),
  });
}
