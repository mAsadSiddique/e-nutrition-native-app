import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../store/auth/hook";
import { AppRoutes } from "../utils/enums";

export default function EntryScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isReady || isLoading) return;
    if (isAuthenticated) {
      router.replace(AppRoutes.TABS);
    } else {
      router.replace(AppRoutes.AUTH_SIGN_UP);
    }
  }, [isAuthenticated, isLoading, router, isReady]);

  return null;
}
