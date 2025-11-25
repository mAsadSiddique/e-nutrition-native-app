import AuthButton from '@/src/components/auth/AuthButton';
import AuthLayout from '@/src/components/auth/AuthLayout';
import { TypographyStyles } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();
  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Nutrition</Text>
          <Text style={styles.title}>Human{'\n'}stories and{'\n'}ideas.</Text>
          <Text style={styles.subtitle}>
            Discover perspectives that deepen understanding.
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          <AuthButton
            text="Sign up with Google"
            onPress={() => {
              // TODO: Implement Google sign up
              console.log('Google sign up pressed');
            }}
            variant="outline"

            leftIcon={
              <Image
                source={require('@/src/assets/images/google.png')}
                style={{
                  width: 20,
                  height: undefined,
                  aspectRatio: 1,
                  resizeMode: 'contain',
                }}
              />
            }
          />
          <AuthButton
            text="Sign up with Email"
            onPress={() => router.push('/auth/sign-up/email')}
            variant="outline"
            leftIcon={
              <Image
                source={require('@/src/assets/images/icon2.png')}
                style={{
                  width: 20,
                  height: undefined,
                  aspectRatio: 1,
                  resizeMode: 'contain',
                }}
              />
            }
          />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/auth/sign-in')}
            >
              Sign in
            </Text>
          </Text>
        </View>
      </View>
    </AuthLayout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: screenHeight * 0.08,
  },
  logo: {
    ...TypographyStyles.h2,
    fontSize: 28,
    marginBottom: screenHeight * 0.08,
    color: '#000',
    letterSpacing: -0.5,
  },
  title: {
   ...TypographyStyles.h3,
    textAlign: 'center',
    fontSize: screenWidth > 375 ? 48 : 52,
    lineHeight: screenWidth > 375 ? 56 : 56,
    marginBottom: screenHeight * 0.03,
    color: '#000',
    letterSpacing: -1,
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: '#000',
    width: "100%",
    letterSpacing: -0.5,
  },
  buttonsContainer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: screenHeight * 0.06,
    paddingHorizontal: 31,
  },
 footerText: {
    ...TypographyStyles.body,
    fontSize: 14,
    lineHeight: 24,
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  footerLink: {
    color: '#1A8917',
    fontWeight: '600',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  facebookIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emailIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
