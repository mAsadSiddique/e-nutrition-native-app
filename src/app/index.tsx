import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function EntryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!isReady) return;
    if (isAuthenticated) {
      router.replace('/category-selection');
    } else {
      router.replace('/auth/sign-up');
    }
  }, [isAuthenticated, router, isReady]);

  return null;
}
