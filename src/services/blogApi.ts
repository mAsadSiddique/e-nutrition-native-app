import { axios } from '@/src/config/axios';
import { SERVER_END_POINTS } from '@/src/constant/server-endpoint';
import { useMutation } from '@tanstack/react-query';

export interface RawBlog {
  id: number;
  title: string;
  content: string;
  categories: number[];
  publishedAt: string;
  media?: any;
}

export const useGetForYouBlogs = () => {
  return useMutation({
    mutationFn: async (): Promise<RawBlog[]> => {
      // Note: axios response interceptor returns `response.data` (server body),
      // so `response` is already the server body: { message, data: { blogs: [...] } }
      // axios interceptor returns response.data (server body), but TS types still
      // expect AxiosResponse. Use `any` to avoid type mismatch and safely read fields.
      const response: any = await axios.get(SERVER_END_POINTS.USER_BLOG);
      const blogs = response?.data?.blogs || response?.blogs || [];
      return blogs;
    },
  });
};

export const useGetFeaturedBlogs = () => {
  return useMutation({
    mutationFn: async (): Promise<RawBlog[]> => {
      // Note: axios response interceptor returns `response.data` (server body),
      // so `response` is already the server body: { message, data: { blogs: [...] } }
      // axios interceptor returns response.data (server body), but TS types still
      // expect AxiosResponse. Use `any` to avoid type mismatch and safely read fields.
      // For now, this calls the same endpoint as For You, but can be changed independently later
      const response: any = await axios.get(SERVER_END_POINTS.USER_BLOG);
      const blogs = response?.data?.blogs || response?.blogs || [];
      return blogs;
    },
  });
};

export const useGetBlog = () => {
  return useMutation({
    mutationFn: async (params: { id?: number | string; slug?: string }): Promise<RawBlog | null> => {
      const { id, slug } = params || {};
      const reqParams: any = {};
      if (id) reqParams.id = id;
      if (slug) reqParams.slug = slug;
      if (!Object.keys(reqParams).length) return null;

      // Call the list endpoint with query params (e.g. /user/blog?id=1 or /user/blog?slug=abc)
      const response: any = await axios.get(SERVER_END_POINTS.USER_BLOG, { params: reqParams });

      // Possible shapes:
      // { message, data: { blog: {...} } }
      // { message, data: { blogs: [ {...} ] } }
      // { message, data: {...} }
      // Accept these variants and return a single blog object
      const blogFromData = response?.data?.blog ?? (Array.isArray(response?.data?.blogs) ? response.data.blogs[0] : null);
      const blog = blogFromData || response?.data || response?.blog || response || null;
      return blog as RawBlog | null;
    },
  });
};
