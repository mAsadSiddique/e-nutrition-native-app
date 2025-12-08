import { TypographyStyles } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useUser } from '@/src/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      <Ionicons 
        name={iconName} 
        size={20} 
        color={isDestructive ? '#dc3545' : '#666'} 
        style={styles.settingIcon} 
      />
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
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log out', 
          style: 'destructive',
          onPress: signOut 
        }
      ]
    );
  }, [signOut]);

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Profile</Text>
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
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
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
    marginBottom: 4,
  },
  userEmail: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
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
    backgroundColor: '#f0f0f0',
    marginLeft: 48,
  },
});


