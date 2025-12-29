import { createReducer } from "@reduxjs/toolkit";
import { setBlogsWishlist, toggleBlogWishlist } from "../wishlist/action";
import { setSavedBlogs, toggleSaveBlog } from "./action";
import { TSavedBlogsState } from "./type";

const initialState: TSavedBlogsState = {
  savedBlogs: [],
};

export const savedBlogs = createReducer(initialState, (builder) => {
  builder
    .addCase(setSavedBlogs, (state, { payload: { savedBlogs } }) => {
      state.savedBlogs = savedBlogs;
    })
    .addCase(toggleSaveBlog, (state, { payload: { blogId } }) => {
      if (state.savedBlogs.includes(blogId)) {
        state.savedBlogs = state.savedBlogs.filter((id) => id !== blogId);
      } else {
        state.savedBlogs = [...state.savedBlogs, blogId];
      }
    })
    // Sync with wishlist when blogsWishlist is set
    .addCase(setBlogsWishlist, (state, { payload: { blogsWishlist } }) => {
      state.savedBlogs = blogsWishlist;
    })
    // Sync with wishlist when blog is toggled
    .addCase(toggleBlogWishlist, (state, { payload: { blogId } }) => {
      if (state.savedBlogs.includes(blogId)) {
        state.savedBlogs = state.savedBlogs.filter((id) => id !== blogId);
      } else {
        state.savedBlogs = [...state.savedBlogs, blogId];
      }
    });
});

