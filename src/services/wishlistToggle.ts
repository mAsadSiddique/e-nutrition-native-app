import { useMutation } from "@tanstack/react-query";
import { axios } from "../config/axios";
import { SERVER_END_POINTS } from "../constant/server-endpoint";
import type { ApiResponse } from "../utils/types";

export interface TWishlistTogglePayload {
  categoryIds: number[];
}

export const useWishlistToggle = () => {
  return useMutation({
    mutationFn: async (
      payload: TWishlistTogglePayload
    ): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.WISHLIST_CATEGORIES, payload);
    },
  });
};
