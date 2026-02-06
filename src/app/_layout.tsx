import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider as ReduxProvider } from 'react-redux';
import type { Persistor } from 'redux-persist';
import { createQueryClient } from '../config/react-query';
import { toastConfig } from '../config/toastConfig';
import { useAuth } from '../store/auth/hook';
import store, { persistor } from '../store/store';

const REHYDRATE_TIMEOUT_MS = 4000;

SplashScreen.preventAutoHideAsync();

const LoadingView = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#0a7ea4" />
  </View>
);

// Shows children once rehydration completes OR after timeout (so app never stays stuck)
function RehydrationGate({
  persistor: p,
  loadingView,
  children,
}: {
  persistor: Persistor;
  loadingView: ReactNode;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = p.getState();
    if (state.bootstrapped) {
      setReady(true);
      return;
    }
    const unsub = p.subscribe(() => {
      if (p.getState().bootstrapped) setReady(true);
    });
    const timeout = setTimeout(() => setReady(true), REHYDRATE_TIMEOUT_MS);
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, [p]);

  if (!ready) return <>{loadingView}</>;
  return <>{children}</>;
}

// Component to initialize auth state
function AuthInitializer({ children }: { children: ReactNode }) {
  const { onSetLoading } = useAuth();

  useEffect(() => {
    onSetLoading(false);
  }, [onSetLoading]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());
  const [loaded, error] = useFonts({
    "Georgia-Regular": require("../assets/fonts/Georgia-Regular.ttf"),
    "Georgia-Bold": require("../assets/fonts/Georgia-Bold.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
  });

  const fontsReady = loaded || !!error;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  // Always show something: loading spinner until fonts ready, then app (with its own loading gate)
  if (!fontsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ReduxProvider store={store}>
      <RehydrationGate loadingView={<LoadingView />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>
            <ThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="category-selection" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="blogs" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="legal" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
              <Toast config={toastConfig} topOffset={60} />
            </ThemeProvider>
          </AuthInitializer>
        </QueryClientProvider>
      </RehydrationGate>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
