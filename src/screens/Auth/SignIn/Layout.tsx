import { Stack } from 'expo-router';

export default function SignIn() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="email" />
      <Stack.Screen name="code" />
    </Stack>
  );
}
