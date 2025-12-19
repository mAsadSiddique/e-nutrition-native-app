import { createAction } from "@reduxjs/toolkit";

export const setSavedBlogs = createAction<{ savedBlogs: number[] }>(
  "savedBlogs/setSavedBlogs"
);

export const toggleSaveBlog = createAction<{ blogId: number }>(
  "savedBlogs/toggleSaveBlog"
);

