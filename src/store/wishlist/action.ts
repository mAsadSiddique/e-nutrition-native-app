import { createAction } from "@reduxjs/toolkit";

export const setWishlist = createAction<{
  blogsWishlist: number[];
  categoriesWishlist: number[] | null;
}>("wishlist/setWishlist");

export const setBlogsWishlist = createAction<{ blogsWishlist: number[] }>(
  "wishlist/setBlogsWishlist"
);

export const setCategoriesWishlist = createAction<{
  categoriesWishlist: number[] | null;
}>("wishlist/setCategoriesWishlist");

export const toggleBlogWishlist = createAction<{ blogId: number }>(
  "wishlist/toggleBlogWishlist"
);

export const toggleCategoryWishlist = createAction<{ categoryId: number }>(
  "wishlist/toggleCategoryWishlist"
);

