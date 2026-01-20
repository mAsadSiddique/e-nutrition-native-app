/**
 * Static URLs and Routes Enum
 * All static URLs and navigation routes used throughout the app
 */

export enum AppRoutes {
  // Main Routes
  HOME = '/(tabs)',
  HOME_INDEX = '/',
  TABS = '/(tabs)',
  TABS_HOME = '/(tabs)/(home)',
  
  // Auth Routes
  AUTH_SIGN_IN = '/auth/sign-in',
  AUTH_SIGN_IN_EMAIL = '/auth/sign-in/email',
  AUTH_SIGN_UP = '/auth/sign-up',
  AUTH_SIGN_UP_EMAIL = '/auth/sign-up/email',
  AUTH_FORGOT_PASSWORD = '/auth/forgot-password',
  AUTH_FORGOT_PASSWORD_CODE = '/auth/forgot-password-code',
  AUTH_RESET_PASSWORD = '/auth/reset-password',
  
  // Profile Routes
  PROFILE_EDIT = '/profile/edit',
  PROFILE_CHANGE_PASSWORD = '/profile/change-password',
  PROFILE_PRIVACY = '/profile/privacy',
  
  // Legal Routes
  LEGAL_TERMS = '/legal/terms',
  LEGAL_PRIVACY = '/legal/privacy',
  
  // Other Routes
  CATEGORY_SELECTION = '/category-selection',
  BLOGS = '/blogs',
}

/**
 * Helper function to build dynamic routes
 */
export const buildRoute = {
  blogDetail: (blogId: string | number, categoryId: string | number, slug: string) => 
    `/blogs/${blogId}/${categoryId}/${slug}`,
  
  authorProfile: (author: string) => 
    `/(tabs)/(home)/author/${encodeURIComponent(author)}`,
  
  homeAuthor: (author: string) => 
    `/(tabs)/(home)/author/${encodeURIComponent(author)}`,
};

/**
 * External URLs
 */
export enum ExternalUrls {
  // Social Media
  LINKEDIN = 'https://www.linkedin.com/in/oneplatforms',
  FACEBOOK = 'https://www.facebook.com/enutrition.me',
  YOUTUBE = 'https://www.youtube.com/@e.nutrition',
  
  // App Stores
  PLAY_STORE = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME',
  APP_STORE = 'https://apps.apple.com/app/idYOUR_APP_ID',
  
  // Image Services
  PRAVATAR_BASE = 'https://i.pravatar.cc',
  PRAVATAR_DEMO = 'https://i.pravatar.cc/200?img=1',
  UNSPLASH_PLACEHOLDER = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop',
  
  // YouTube
  YOUTUBE_THUMBNAIL_BASE = 'https://img.youtube.com/vi',
}

/**
 * Helper functions for external URLs
 */
export const buildExternalUrl = {
  pravatar: (size: number = 150, seed?: string) => {
    const base = `${ExternalUrls.PRAVATAR_BASE}/${size}`;
    return seed ? `${base}?u=${encodeURIComponent(seed)}` : base;
  },
  
  youtubeThumbnail: (videoId: string) => 
    `${ExternalUrls.YOUTUBE_THUMBNAIL_BASE}/${videoId}/maxresdefault.jpg`,
};

