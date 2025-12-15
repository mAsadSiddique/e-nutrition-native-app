import { Stack } from 'expo-router';
import React from 'react';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#222',
      }}
    >
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
