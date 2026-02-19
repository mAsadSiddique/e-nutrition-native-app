import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../store/auth/hook";
import { AppRoutes } from "../utils/enums";

export default function EntryScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || isLoading || hasNavigated) return;
    setHasNavigated(true);
    // Always go to home screen, skip login
    router.replace(AppRoutes.TABS);
  }, [isReady, isLoading, hasNavigated, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0a7ea4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
