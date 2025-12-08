import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '../contexts/AuthContext';
import { SavedBlogsProvider } from '../contexts/SavedBlogsContext';
import { UserProvider } from '../contexts/UserContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('Font loading started...');

  const [loaded, error] = useFonts({
    // "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Georgia-Regular": require("../assets/fonts/Georgia-Regular.ttf"),
    "Georgia-Bold": require("../assets/fonts/Georgia-Bold.ttf"),
  });
  console.log("📌 loaded:", loaded);
  console.log("📌 error:", error);

  useEffect(() => {
    if (loaded) {
      console.log("✅ Fonts loaded successfully!");
      SplashScreen.hideAsync();
    }

    if (error) {
      console.log("❌ Font load failed:", error);
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <UserProvider>
        <SavedBlogsProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="category-selection" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="blogs" options={{ headerShown: false }} />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="sign-up" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="font-test" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </SavedBlogsProvider>
      </UserProvider>
    </AuthProvider>
  );
}
