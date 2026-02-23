/**
 * Custom hook for toggling blog wishlist
 * Centralized wishlist toggle functionality
 */

import { AppRoutes } from "@/src/utils/enums";
import { toast } from "@/src/utils/toast";
import { useBlogWishlistToggle } from "@/src/services/blogApi";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { useWishlistSelector } from "@/src/store/wishlist/selector";
import { useCurrentProfile } from "./index";
import { useRouter } from "expo-router";
import { useCallback } from "react";

export const useWishlistToggle = () => {
  const router = useRouter();
  const { isLoggedIn } = useCurrentProfile();
  const { blogsWishlist } = useWishlistSelector();
  const { toggleBlogWishlist: toggleWishlistInStore } = useWishlistHandler();
  const { mutate: toggleBlogWishlist, isPending: wishlistLoading } =
    useBlogWishlistToggle();

  const handleToggleWishlist = useCallback(
    (blogId: number) => {
      // Check if user is authenticated before allowing save
      if (!isLoggedIn) {
        router.replace(AppRoutes.AUTH_SIGN_IN);
        return;
      }

      // Check if blog is currently in wishlist to determine action
      const isCurrentlyInWishlist = blogsWishlist.includes(blogId);

      // Call API to toggle wishlist
      toggleBlogWishlist(
        { id: blogId },
        {
          onSuccess: (data) => {
            if (isCurrentlyInWishlist) {
              toast.success("Removed from saved articles", "Removed");
            } else {
              toast.success("Added to saved articles", "Saved");
            }
          },
          onError: (error: any) => {
            // Show error toast
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to update wishlist";
            toast.error(errorMessage, "Error");
          },
        },
      );
      toggleWishlistInStore(blogId);
    },
    [
      isLoggedIn,
      router,
      toggleWishlistInStore,
      toggleBlogWishlist,
      blogsWishlist,
    ],
  );

  return {
    handleToggleWishlist,
    wishlistLoading,
    blogsWishlist,
  };
};
