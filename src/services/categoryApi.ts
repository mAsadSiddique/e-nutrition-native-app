import { axios } from '@/src/config/axios';
import { SERVER_END_POINTS } from '@/src/constant/server-endpoint';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export interface SimpleCategory {
  id: number;
  name: string;
}

export const useGetCategories = (opts?: Partial<UseQueryOptions<SimpleCategory[], Error>>) => {
  return useQuery<SimpleCategory[]>({
    queryKey: ['categories'],
    queryFn: async (): Promise<SimpleCategory[]> => {
      const response: any = await axios.get(SERVER_END_POINTS.CATEGORIES);
      // API may respond with { data: [...] } or directly with an array
      const list = response?.data?.data ?? response?.data ?? response ?? [];
      // Only map top-level entries (ignore any nested 'children')
      return (Array.isArray(list) ? list : []).map((item: any) => ({ id: item.id, name: item.name }));
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
    ...opts,
  });
};
