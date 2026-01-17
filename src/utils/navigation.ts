import { router } from 'expo-router';

export const navigateToMain = () => {
  try {
    router.replace('/(tabs)');
  } catch (error) {
    console.error('[Navigation] Failed to navigate to main screen:', error);
  }
};

