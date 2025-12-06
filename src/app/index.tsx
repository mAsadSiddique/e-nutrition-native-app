import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

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
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/sign-up');
    }
  }, [isAuthenticated, isLoading, router, isReady]);

  return null;
}
