import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { TypographyStyles } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function AuthChoiceScreen() {
  const router = useRouter();
  return (
    <AuthLayout>
      <View style={styles.content}>
        <View style={styles.buttons}>
          <AuthButton
            text="Sign up"
            onPress={() => router.push('/auth/sign-up')}
            variant="primary"
          />
          <AuthButton
            text="Sign in"
            onPress={() => router.push('/auth/sign-in')}
            variant="outline"
          />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%', 
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical:20,
     width: '100%', 
  },
  logo: {
    ...TypographyStyles.h2,
    marginBottom: 48,
    color: '#222',
  },
  title: {
    // ...TypographyStyles.h1,
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
    marginBottom: 16,
    color: '#222',
    width: '100%',
    paddingHorizontal: 10,
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000000',
    maxWidth: 350,
  },
  buttons: {
    paddingBottom: 40,
    paddingTop: 20,
    width: '100%',
  },
});
