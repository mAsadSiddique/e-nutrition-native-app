import { Stack } from 'expo-router';

export default function SignInLayout() {
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
        name="email" 
        options={{ 
          headerTitle: '',
        }} 
      />
      <Stack.Screen 
        name="code" 
        options={{ 
          headerTitle: '',
        }} 
      />
    </Stack>
  );
}
