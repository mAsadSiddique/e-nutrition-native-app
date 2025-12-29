import { createReducer } from "@reduxjs/toolkit";
import {
    setBlogsWishlist,
    setCategoriesWishlist,
    setWishlist,
    toggleBlogWishlist,
    toggleCategoryWishlist,
} from "./action";
import { TWishlistState } from "./type";

const initialState: TWishlistState = {
  blogsWishlist: [],
  categoriesWishlist: null,
};

export const wishlist = createReducer(initialState, (builder) => {
  builder
    .addCase(setWishlist, (state, { payload: { blogsWishlist, categoriesWishlist } }) => {
      state.blogsWishlist = blogsWishlist || [];
      state.categoriesWishlist = categoriesWishlist;
    })
    .addCase(setBlogsWishlist, (state, { payload: { blogsWishlist } }) => {
      state.blogsWishlist = blogsWishlist;
    })
    .addCase(setCategoriesWishlist, (state, { payload: { categoriesWishlist } }) => {
      state.categoriesWishlist = categoriesWishlist;
    })
    .addCase(toggleBlogWishlist, (state, { payload: { blogId } }) => {
      if (state.blogsWishlist.includes(blogId)) {
        state.blogsWishlist = state.blogsWishlist.filter((id) => id !== blogId);
      } else {
        state.blogsWishlist = [...state.blogsWishlist, blogId];
      }
    })
    .addCase(toggleCategoryWishlist, (state, { payload: { categoryId } }) => {
      const currentList = state.categoriesWishlist || [];
      if (currentList.includes(categoryId)) {
        state.categoriesWishlist = currentList.filter((id) => id !== categoryId);
      } else {
        state.categoriesWishlist = [...currentList, categoryId];
      }
    });
});

