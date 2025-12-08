import AuthButton from '@/src/components/auth/AuthButton';
import { TypographyStyles } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password validation
  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const newPasswordValidation = validatePassword(newPassword);
  const isNewPasswordValid = Object.values(newPasswordValidation).every(Boolean);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!isNewPasswordValid) {
      Alert.alert('Error', 'New password must meet all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // TODO: Uncomment when backend is ready
      // await changeUserPassword({
      //   currentPassword: currentPassword,
      //   newPassword: newPassword
      // });
      
      // For now, simulate success
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Success',
          'Password changed successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }, 1000);
      
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to change password'
      );
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, isNewPasswordValid, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new secure password.
          </Text>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                textContentType="none"
                importantForAutofill="no"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                textContentType="none"
                importantForAutofill="no"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showNewPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
              <View style={styles.validationContainer}>
                <Text style={[styles.validationText, newPasswordValidation.minLength ? styles.validText : styles.invalidText]}>
                  {newPasswordValidation.minLength ? '✓' : '✗'} Minimum 8 characters
                </Text>
                <Text style={[styles.validationText, newPasswordValidation.hasUppercase ? styles.validText : styles.invalidText]}>
                  {newPasswordValidation.hasUppercase ? '✓' : '✗'} One uppercase letter
                </Text>
                <Text style={[styles.validationText, newPasswordValidation.hasLowercase ? styles.validText : styles.invalidText]}>
                  {newPasswordValidation.hasLowercase ? '✓' : '✗'} One lowercase letter
                </Text>
                <Text style={[styles.validationText, newPasswordValidation.hasNumber ? styles.validText : styles.invalidText]}>
                  {newPasswordValidation.hasNumber ? '✓' : '✗'} One number
                </Text>
                <Text style={[styles.validationText, newPasswordValidation.hasSpecialChar ? styles.validText : styles.invalidText]}>
                  {newPasswordValidation.hasSpecialChar ? '✓' : '✗'} One special character
                </Text>
              </View>
            )}
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                textContentType="none"
                importantForAutofill="no"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text style={[styles.validationText, styles.invalidText]}>
                ✗ Passwords do not match
              </Text>
            )}
          </View>

          <AuthButton
            text="Change Password"
            onPress={handleChangePassword}
            variant="primary"
            disabled={!currentPassword || !isNewPasswordValid || newPassword !== confirmPassword}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...TypographyStyles.h2,
    fontSize: 20,
    color: '#000',
    fontWeight: '600',
  },
  headerSpacer: {
    width: 32,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  subtitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...TypographyStyles.body,
    color: '#222',
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 48,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#222',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  validationContainer: {
    marginTop: 8,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  validText: {
    color: '#28a745',
  },
  invalidText: {
    color: '#dc3545',
  },
});
