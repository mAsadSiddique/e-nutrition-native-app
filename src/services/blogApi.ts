import { axios } from "@/src/config/axios";
import { SERVER_END_POINTS } from "@/src/constant/server-endpoint";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QueryKey } from "../utils/enums";
import { generateUrlParams } from "../utils/generateURlParams";
import type { ApiResponse } from "../utils/types";
import type {
  TApiResponse,
  TBlogsListing,
  TExploreBlogs,
} from "../utils/types/blogs";

// getting blogs listing...
export const useBlogsListing = ({
  id,
  ids,
  search,
  slug,
  sortBy,
  tags,
  categoryIds,
  enabled,
}: TExploreBlogs & { enabled?: boolean }) => {
  return useQuery({
    queryKey: [
      QueryKey.BLOGS_LISTING,
      id,
      ids,
      search,
      slug,
      sortBy,
      categoryIds,
      tags,
    ],
    queryFn: async (): Promise<TApiResponse> => {
      const payload = {
        ...(id && { id }),
        ...(ids && { ids }),
        ...(slug && { slug }),
        ...(tags && { tags }),
        ...(search && { search }),
        ...(categoryIds && { categoryIds }),
      };
      return await axios.get(
        `${SERVER_END_POINTS.USER_BLOG}?${generateUrlParams(payload)}`
      );
    },
    select: (response) => {
      return response?.data?.blogs as TBlogsListing[];
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};

// toggle for wishlisting of blogs...
export const useBlogWishlistToggle = () => {
  return useMutation({
    mutationFn: async (payload: { id: number }): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.BLOG_WISHLIST_TOGGLE, payload);
    },
  });
};
