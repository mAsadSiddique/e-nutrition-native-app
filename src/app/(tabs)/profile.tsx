import LogoutSheet from '@/src/components/auth/LogoutSheet';
import { useAuth } from '@/src/contexts/AuthContext';
import { useUser } from '@/src/contexts/UserContext';
import { useGetProfile } from '@/src/services/authApi';
import { TypographyStyles } from '@/src/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingItemProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showArrow?: boolean;
  isDestructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  title, 
  iconName, 
  onPress, 
  showArrow = true, 
  isDestructive = false 
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
   <View style={styles.settingLeft}>
  <View style={styles.settingIconWrapper}>
    <Ionicons 
      name={iconName} 
      size={18} 
      color={isDestructive ? '#dc3545' : '#333'} 
    />
  </View>

  <Text style={[styles.settingText, isDestructive && styles.destructiveText]}>
    {title}
  </Text>
</View>

    {showArrow && (
      <Ionicons name="chevron-forward-outline" size={16} color="#ccc" />
    )}
  </TouchableOpacity>
);

export default function ProfileTab() {
  const { userProfile, updateProfile } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);
  
  // Fetch real-time profile data using mutation
  const { mutate: fetchProfile, data: profileData, isPending: profileLoading, error: profileError } = useGetProfile();

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile(undefined, {
      onSuccess: (data) => {
        console.log('Profile fetch successful:', data);
      },
      onError: (error: any) => {
        console.error('Profile fetch error:', error);
        const status = error?.response?.status;
        
        if (status === 401) {
          // Token is invalid or expired - trigger logout
          console.log('Token expired, logging out...');
          signOut();
        }
        // For other errors, just show error state
      }
    });
  }, [fetchProfile, signOut]);
  
  useEffect(() => {
    if (profileData) {
      console.log('Profile API data received:', profileData);
      updateProfile({
        name: profileData.username,
        email: profileData.email,
        ...(profileData.profileImage && { profileImage: profileData.profileImage }),
      });
    }
  }, [profileData, updateProfile]);

  const handleImagePicker = useCallback(async () => {
    // TODO: Implement image picker when expo-image-picker is available
    // For now, show placeholder functionality
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
              profileImage: 'https://i.pravatar.cc/200?img=1' 
            });
          }
        }
      ]
    );
  }, [updateProfile]);

  const handleEditProfile = useCallback(() => {
    router.push('/profile/edit');
  }, [router]);

  const handleChangePassword = useCallback(() => {
    router.push('/profile/change-password');
  }, [router]);

  const handlePrivacy = useCallback(() => {
    router.push('/profile/privacy');
  }, [router]);
 
  const handleLogout = useCallback(() => {
    setShowLogoutSheet(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setShowLogoutSheet(false);
    await signOut();
    router.replace('/auth/sign-in');
  }, [signOut, router]);

  const renderProfileImage = () => {
    // Prioritize API data over local data
    const imageUri = profileData?.profileImage || userProfile.profileImage;
    
    if (imageUri) {
      return (
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
      );
    }
    
    return (
      <View style={styles.profileImagePlaceholder}>
        <Ionicons name="person" size={40} color="#999" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* <Text style={styles.headerTitle}>Profile</Text> */}
        </View>

        {/* User Info Section */}
        <View style={styles.userSection}>
          <Pressable onPress={handleImagePicker} style={styles.imageContainer}>
            {renderProfileImage()}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </Pressable>
          
          <View style={styles.userInfo}>
            {profileLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00994C" />
                <Text style={styles.loadingText}>Loading profile...</Text>
              </View>
            ) : profileError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
                {/* <TouchableOpacity onPress={() => fetchProfile()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity> */}
              </View>
            ) : (
              <>
                <Text style={styles.userName}>{profileData?.username || userProfile.name}</Text>
                <Text style={styles.userEmail}>{profileData?.email || userProfile.email}</Text>
              </>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          {/* <Text style={styles.sectionTitle}>Settings</Text> */}
          
          <View style={styles.settingsList}>
            <SettingItem
              title="Edit Profile"
              iconName="person-outline"
              onPress={handleEditProfile}
            />
            <View style={styles.divider} />
            
            <SettingItem
              title="Change Password"
              iconName="lock-closed-outline"
              onPress={handleChangePassword}
            />
            {/* <View style={styles.divider} />  
            <SettingItem
              title="Privacy"
              iconName="shield-outline"
              onPress={handlePrivacy}
            /> */}
            <View style={styles.divider} />
            
            <SettingItem
              title="Log out"
              iconName="log-out-outline"
              onPress={handleLogout}
              showArrow={false}
              isDestructive={true}
            />
          </View>
        </View>
      </ScrollView>

      <LogoutSheet
        visible={showLogoutSheet}
        onClose={() => setShowLogoutSheet(false)}
        onConfirm={handleLogoutConfirm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  settingIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDEDED', // Soft modern gray
    borderColor: '#C7C7C7',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: '#fff',
    // borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    ...TypographyStyles.h2,
    fontSize: 28,
    color: '#000',
    letterSpacing: -0.5,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
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
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    ...TypographyStyles.h2,
    fontSize: 22,
    color: '#000',
    marginBottom: 0,   // smoother, more natural spacing
  },
  
  userEmail: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#444',

    marginTop: 0,      // slight soft gap above email
  },
  
  settingsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    // borderWidth: 1,
    // borderColor: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
    // color: '#000',
  },
  settingText: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#000',
  },
  destructiveText: {
    color: '#dc3545',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 20,
    marginRight:20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  errorText: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00994C',
    borderRadius: 6,
  },
  retryText: {
    ...TypographyStyles.body,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});


