import { useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setBlogsWishlist, toggleBlogWishlist } from "../wishlist/action";
import { setSavedBlogs, toggleSaveBlog } from "./action";
import { useSavedBlogsSelector } from "./selector";

// Combined hook that matches the context interface
export const useSavedBlogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savedBlogsState = useSavedBlogsSelector();

  const onSetSavedBlogs = useCallback(
    (savedBlogs: number[]) => {
      dispatch(setSavedBlogs({ savedBlogs }));
    },
    [dispatch]
  );

  const onToggleSaveBlog = useCallback(
    (blogId: number) => {
      dispatch(toggleSaveBlog({ blogId }));
      // Also update wishlist to keep them in sync
      dispatch(toggleBlogWishlist({ blogId }));
    },
    [dispatch]
  );

  const onSetBlogsWishlist = useCallback(
    (blogsWishlist: number[]) => {
      dispatch(setBlogsWishlist({ blogsWishlist }));
    },
    [dispatch]
  );

  // Return interface matching SavedBlogsContext
  return {
    savedBlogs: savedBlogsState.savedBlogs,
    toggleSaveBlog: onToggleSaveBlog,
    setBlogsWishlist: onSetBlogsWishlist,
  };
};

