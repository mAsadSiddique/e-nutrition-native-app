import { useCurrentProfile } from "@/src/hooks";
import { Wishlist } from "@/src/screens";
import { AppRoutes } from "@/src/utils/enums";
import { useRouter } from "expo-router";
import React, { useEffect } from 'react';

export default function BookmarksTab() {
  // Require authentication - automatically redirects to login if not authenticated
  const { isLoggedIn } = useCurrentProfile();

  const router = useRouter();

  // Redirect to sign-in if not authenticated (useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(AppRoutes.AUTH_SIGN_IN);
    }
  }, [isLoggedIn, router]);

  // Don't render wishlist if not authenticated (will redirect)
  if (!isLoggedIn) {
    return null;
  }

  return <Wishlist />;
}
