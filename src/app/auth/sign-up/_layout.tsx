import { Stack } from 'expo-router';

export default function SignUpLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="email" 
        options={{ 
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#222',
        }} 
      />
      <Stack.Screen 
        name="code" 
        options={{ 
          headerShown: true,
          title: '',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#222',
        }} 
      />
    </Stack>
  );
}
