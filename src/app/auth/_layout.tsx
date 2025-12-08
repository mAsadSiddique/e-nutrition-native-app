import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerBackTitleVisible: false,
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#222',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="sign-up" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="sign-in" 
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          headerTitle: '',
        }} 
      />
      <Stack.Screen 
        name="forgot-password-code" 
        options={{ 
          headerTitle: '',
        }} 
      />
      <Stack.Screen 
        name="reset-password" 
        options={{ 
          headerTitle: '',
        }} 
      />
      <Stack.Screen 
        name="set-password" 
        options={{ 
          headerTitle: '',
        }} 
      />
    </Stack>
  );
}
