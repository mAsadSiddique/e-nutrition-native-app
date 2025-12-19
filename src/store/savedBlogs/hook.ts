import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { setSavedBlogs, toggleSaveBlog } from "./action";
import type { AppDispatch } from "../store";
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
    },
    [dispatch]
  );

  // Return interface matching SavedBlogsContext
  return {
    savedBlogs: savedBlogsState.savedBlogs,
    toggleSaveBlog: onToggleSaveBlog,
  };
};

