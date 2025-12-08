import AuthButton from '@/src/components/auth/AuthButton';
import { useChangePassword } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { validateConfirmPassword, validatePasswordRules } from '@/src/utils/validators';
import { toast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Error states
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const { mutate: changePassword, isPending: loading } = useChangePassword();

  const handleChangePassword = useCallback(async () => {
    setSubmitted(true);

    // Validate all fields
    const currentPasswordErr = !currentPassword || !currentPassword.trim() ? 'Please enter your current password' : null;
    const passwordValidation = validatePasswordRules(newPassword);
    const newPasswordErr = passwordValidation.isValid ? null : 'New password must meet all requirements';
    const confirmPasswordErr = validateConfirmPassword(newPassword, confirmPassword);

    // Additional validation: new password must be different from current
    let finalNewPasswordErr = newPasswordErr;
    if (!newPasswordErr && currentPassword === newPassword) {
      finalNewPasswordErr = 'New password must be different from current password';
    }

    // Set error states
    setCurrentPasswordError(currentPasswordErr);
    setNewPasswordError(finalNewPasswordErr);
    setConfirmPasswordError(confirmPasswordErr);

    // If any validation fails, stop here
    if (currentPasswordErr || finalNewPasswordErr || confirmPasswordErr) {
      return;
    }

    changePassword({
      oldPassword: currentPassword,
      password: newPassword,
      confirmPassword: confirmPassword
    }, {
      onSuccess: (data: any) => {
        if (data.status === 200 || data.success) {
          toast.success('Password changed successfully!');
          router.back();
        }
      },
      onError: (error: any) => {
        const errorData = error?.response?.data;
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            toast.error(errorData.message[0]);
          } else {
            toast.error(errorData.message);
          }
        } else {
          toast.error('Failed to change password. Please try again.');
        }
      }
    });
  }, [currentPassword, newPassword, confirmPassword, isNewPasswordValid, changePassword, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Form Section */}
        <View style={styles.formSection}>
         

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (submitted) {
                    setCurrentPasswordError(!text || !text.trim() ? 'Please enter your current password' : null);
                  }
                }}
                placeholder="Current password"
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
            {submitted && currentPasswordError && (
              <Text style={[styles.validationText, styles.invalidText]}>
                ✗ {currentPasswordError}
              </Text>
            )}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (submitted) {
                    const validation = validatePasswordRules(text);
                    let err = validation.isValid ? null : 'New password must meet all requirements';
                    // Check if new password is different from current
                    if (!err && currentPassword === text) {
                      err = 'New password must be different from current password';
                    }
                    setNewPasswordError(err);
                    // Re-validate confirm password if it has been entered
                    if (confirmPassword) {
                      setConfirmPasswordError(validateConfirmPassword(text, confirmPassword));
                    }
                  }
                }}
                placeholder=" New password"
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

            {submitted && (() => {
              const passwordValidation = validatePasswordRules(newPassword);
              const failingRules = [];
              
              if (!passwordValidation.rules.minLength) {
                failingRules.push('Minimum 8 characters');
              }
              if (!passwordValidation.rules.hasUppercase) {
                failingRules.push('One uppercase letter');
              }
              if (!passwordValidation.rules.hasLowercase) {
                failingRules.push('One lowercase letter');
              }
              if (!passwordValidation.rules.hasNumber) {
                failingRules.push('One number');
              }
              if (!passwordValidation.rules.hasSpecialChar) {
                failingRules.push('One special character');
              }
              
              // Add custom error if new password is same as current
              if (newPasswordError && newPasswordError !== 'New password must meet all requirements') {
                failingRules.push(newPasswordError);
              }
              
              if (failingRules.length === 0) {
                return null;
              }
              
              return (
                <View style={styles.validationContainer}>
                  {failingRules.map((rule, index) => (
                    <Text key={index} style={[styles.validationText, styles.invalidText]}>
                      ✗ {rule}
                    </Text>
                  ))}
                </View>
              );
            })()}
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (submitted) {
                    setConfirmPasswordError(validateConfirmPassword(newPassword, text));
                  }
                }}
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

            {submitted && confirmPasswordError && (
              <Text style={[styles.validationText, styles.invalidText]}>
                ✗ {confirmPasswordError}
              </Text>
            )}
          </View>

          <AuthButton
            text="Change Password"
            onPress={handleChangePassword}
            variant="primary"
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
    marginBottom: 5,
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
