import { router } from 'expo-router';
import { AppRoutes } from './enums';

export const navigateToMain = () => {
  try {
    router.replace(AppRoutes.TABS);
  } catch (error) {
    console.error('[Navigation] Failed to navigate to main screen:', error);
  }
};

