// import { useAuth } from "@/src/store/auth/hook";
// import { useRouter } from "expo-router";
// import { useEffect, useRef } from "react";

// interface UseRequireAuthOptions {
//   /**
//    * Custom redirect path when user is not authenticated
//    * @default '/auth/sign-in'
//    */
//   redirectTo?: string;
//   /**
//    * Whether to redirect immediately or just return the auth status
//    * @default true
//    */
//   redirect?: boolean;
// }

// /**
//  * Hook to require authentication for a screen/component
//  * Automatically redirects to login screen if user is not authenticated
//  *
//  * @param options - Configuration options
//  * @returns Object containing authentication status and loading state
//  *
//  * @example
//  * ```tsx
//  * function ProtectedScreen() {
//  *   const { isAuthenticated } = useRequireAuth();
//  *
//  *   if (!isAuthenticated) return null;
//  *
//  *   return <View>Protected Content</View>;
//  * }
//  * ```
//  *
//  * @example
//  * ```tsx
//  * function CustomProtectedScreen() {
//  *   const { isAuthenticated } = useRequireAuth({
//  *     redirectTo: '/auth/custom-login',
//  *     redirect: true
//  *   });
//  *
//  *   return <View>Content</View>;
//  * }
//  * ```
//  */
// export function useRequireAuth(options: UseRequireAuthOptions = {}) {
//   const { redirectTo = '/auth/sign-in', redirect = true } = options;
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();
//   const hasRedirected = useRef(false);

//   useEffect(() => {
//     if (!redirect) return;

//     // Don't redirect while loading - wait for auth state to be determined
//     if (isLoading) {
//       hasRedirected.current = false;
//       return;
//     }

//     // Only redirect if not authenticated and we haven't already redirected
//     if (!isAuthenticated && !hasRedirected.current) {
//       hasRedirected.current = true;
//       router.replace(redirectTo);
//     } else if (isAuthenticated) {
//       // Reset the redirect flag when authenticated
//       hasRedirected.current = false;
//     }
//   }, [isAuthenticated, isLoading, redirect, redirectTo, router]);

//   return {
//     isAuthenticated,
//     isLoading,
//   };
// }
