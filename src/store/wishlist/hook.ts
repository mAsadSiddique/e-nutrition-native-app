import { useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import {
  setBlogsWishlist,
  setCategoriesWishlist,
  setWishlist,
  toggleBlogWishlist,
  toggleCategoryWishlist,
} from "./action";

export interface TWishlistPayload {
  blogsWishlist: number[];
  categoriesWishlist: number[] | null;
}

export const useWishlistHandler = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const wishlistState = useWishlistSelector();

  const onSetWishlist = useCallback(
    (payload: TWishlistPayload) => {
      dispatch(setWishlist(payload));
    },
    [dispatch]
  );

  const onSetBlogsWishlist = useCallback(
    (blogsWishlist: number[]) => {
      dispatch(setBlogsWishlist({ blogsWishlist }));
    },
    [dispatch]
  );

  const onSetCategoriesWishlist = useCallback(
    (categoriesWishlist: number[] | null) => {
      console.debug(
        "[WishlistHook] dispatching setCategoriesWishlist with:",
        categoriesWishlist
      );
      dispatch(setCategoriesWishlist({ categoriesWishlist }));
    },
    [dispatch]
  );

  const onToggleBlogWishlist = useCallback(
    (blogId: number) => {
      dispatch(toggleBlogWishlist({ blogId }));
    },
    [dispatch]
  );

  const onToggleCategoryWishlist = useCallback(
    (categoryId: number) => {
      dispatch(toggleCategoryWishlist({ categoryId }));
    },
    [dispatch]
  );

  return {
    // blogsWishlist: wishlistState.blogsWishlist,
    // categoriesWishlist: wishlistState.categoriesWishlist,
    setWishlist: onSetWishlist,
    setBlogsWishlist: onSetBlogsWishlist,
    setCategoriesWishlist: onSetCategoriesWishlist,
    toggleBlogWishlist: onToggleBlogWishlist,
    toggleCategoryWishlist: onToggleCategoryWishlist,
  };
};
