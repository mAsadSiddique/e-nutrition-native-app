import { axios } from '@/src/config/axios';
import { SERVER_END_POINTS } from '@/src/constant/server-endpoint';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export interface SimpleCategory {
  id: number;
  name: string;
  icon?: string;
  image?: string;
  subtitle?: string;
  description?: string;
  backgroundColor?: string;
  [key: string]: any; // Allow other fields from API
}

export interface Category {
  id: number;
  name: string;
  icon?: string;
  image?: string;
  subtitle?: string;
  description?: string;
  backgroundColor?: string;
  children?: Category[];
  [key: string]: any; // Allow other fields from API
}

export const useGetCategories = (opts?: Partial<UseQueryOptions<SimpleCategory[], Error>>) => {
  return useQuery<SimpleCategory[]>({
    queryKey: ['categories'],
    queryFn: async (): Promise<SimpleCategory[]> => {
      const response: any = await axios.get(SERVER_END_POINTS.CATEGORIES);
      // API may respond with { data: [...] } or directly with an array
      const list = response?.data?.data ?? response?.data ?? response ?? [];
      // Map all available fields from API
      return (Array.isArray(list) ? list : []).map((item: any) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        image: item.image,
        subtitle: item.subtitle,
        description: item.description,
        backgroundColor: item.backgroundColor,
        ...item, // Include any other fields from API
      }));
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
    ...opts,
  });
};

/**
 * Get full category structure with nested children
 */
export const useGetCategoriesWithChildren = (opts?: Partial<UseQueryOptions<Category[], Error>>) => {
  return useQuery<Category[]>({
    queryKey: ['categories', 'with-children'],
    queryFn: async (): Promise<Category[]> => {
      const response: any = await axios.get(SERVER_END_POINTS.CATEGORIES);
      // API may respond with { data: [...] } or directly with an array
      const list = response?.data?.data ?? response?.data ?? response ?? [];
      // Map categories including nested children and all fields
      const mapCategory = (item: any): Category => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        image: item.image,
        subtitle: item.subtitle,
        description: item.description,
        backgroundColor: item.backgroundColor,
        children: Array.isArray(item.children) && item.children.length > 0
          ? item.children.map(mapCategory)
          : undefined,
        ...item, // Include any other fields from API
      });
      return (Array.isArray(list) ? list : []).map(mapCategory);
    },
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
    ...opts,
  });
};

/**
 * Extract all category IDs from a category tree (including nested children)
 */
export const extractAllCategoryIds = (category: Category): number[] => {
  const ids = [category.id];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids.push(...extractAllCategoryIds(child));
    });
  }
  return ids;
};

/**
 * Extract all category IDs from an array of categories (including nested children)
 */
export const extractAllCategoryIdsFromArray = (categories: Category[]): number[] => {
  const allIds: number[] = [];
  categories.forEach((category) => {
    allIds.push(...extractAllCategoryIds(category));
  });
  return allIds;
};
