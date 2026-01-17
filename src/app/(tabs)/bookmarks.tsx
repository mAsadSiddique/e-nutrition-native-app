import { useCurrentProfile } from "@/src/hooks";
import { Wishlist } from "@/src/screens";
import { useRouter } from "expo-router";
import React from 'react';

export default function BookmarksTab() {
  // Require authentication - automatically redirects to login if not authenticated
  const { isLoggedIn } = useCurrentProfile();

  const router = useRouter();

  // Don't render wishlist if not authenticated (will redirect)
  if (!isLoggedIn) {
    return router.replace('/auth/sign-in');
  }

  return <Wishlist />;
}
