import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="sign-up" 
        options={{ 
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="sign-in" 
        options={{ 
          presentation: 'modal'
        }} 
      />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="forgot-password-code" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="set-password" />
    </Stack>
  );
}
