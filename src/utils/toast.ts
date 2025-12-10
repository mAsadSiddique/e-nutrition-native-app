import { Alert } from 'react-native';

export const toast = {
  success: (message: string) => {
    Alert.alert('Success', message);
  },
  error: (message: string) => {
    Alert.alert('Error', message);
  }
};
