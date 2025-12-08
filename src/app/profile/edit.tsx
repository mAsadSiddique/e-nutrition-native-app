import AuthButton from '@/src/components/auth/AuthButton';
import { TypographyStyles } from '@/src/constants/theme';
import { useUser } from '@/src/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { userProfile, updateProfile } = useUser();
  const router = useRouter();
  
  const [name, setName] = useState(userProfile.name);
  const [loading, setLoading] = useState(false);

  const handleImagePicker = useCallback(async () => {
    // TODO: Implement image picker when expo-image-picker is available
    Alert.alert(
      'Update Profile Picture',
      'Image picker functionality will be available when expo-image-picker is installed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Use Demo Image', 
          onPress: () => {
            // Set a demo image URL for testing
            updateProfile({ 
              profileImage: 'https://i.pravatar.cc/200?img=' + Math.floor(Math.random() * 10 + 1)
            });
          }
        }
      ]
    );
  }, [updateProfile]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // TODO: Uncomment when backend is ready
      // await updateUserProfile({ name: name.trim() });
      
      // For now, update locally
      setTimeout(() => {
        updateProfile({ name: name.trim() });
        setLoading(false);
        Alert.alert(
          'Success',
          'Profile updated successfully',
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
        error instanceof Error ? error.message : 'Failed to update profile'
      );
      setLoading(false);
    }
  }, [name, updateProfile, router]);

  const renderProfileImage = () => {
    if (userProfile.profileImage) {
      return (
        <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
      );
    }
    
    return (
      <View style={styles.profileImagePlaceholder}>
        <Ionicons name="person" size={40} color="#999" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Pressable onPress={handleImagePicker} style={styles.imageContainer}>
            {renderProfileImage()}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          <Text style={styles.imageHint}>Tap to change photo</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userProfile.email}
              editable={false}
            />
            <Text style={styles.inputHint}>Email cannot be changed</Text>
          </View>

          <AuthButton
            text="Save Changes"
            onPress={handleSave}
            variant="primary"
            disabled={!name.trim() || name === userProfile.name}
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
  imageSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  imageHint: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    paddingHorizontal: 20,
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
  input: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#222',
  },
  disabledInput: {
    backgroundColor: '#f8f8f8',
    color: '#666',
  },
  inputHint: {
    ...TypographyStyles.body,
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
