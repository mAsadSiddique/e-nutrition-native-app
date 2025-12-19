import { createReducer } from "@reduxjs/toolkit";
import { TSavedBlogsState } from "./type";
import { setSavedBlogs, toggleSaveBlog } from "./action";

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
    });
});

