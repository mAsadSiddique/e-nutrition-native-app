import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useState } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createQueryClient } from '../config/react-query';
import { toastConfig } from '../config/toastConfig';
import { useAuth } from '../store/auth/hook';
import store, { persistor } from '../store/store';

SplashScreen.preventAutoHideAsync();

// Component to initialize auth state
function AuthInitializer({ children }: { children: ReactNode }) {
  const { onSetLoading } = useAuth();

  useEffect(() => {
    // Set loading to false after initial check
    // Token is managed separately in storage, profile will be loaded when needed
    onSetLoading(false);
  }, [onSetLoading]);

  return <>{children}</>;
}
export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());
  const [loaded, error] = useFonts({
    "Georgia-Regular": require("../assets/fonts/Georgia-Regular.ttf"),
    "Georgia-Bold": require("../assets/fonts/Georgia-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    if (error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded) return null;

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
                <Stack.Screen name="sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="font-test" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
              <Toast config={toastConfig} topOffset={60} />
            </ThemeProvider>
          </AuthInitializer>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
