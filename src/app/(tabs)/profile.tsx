import LogoutSheet from "@/src/components/auth/LogoutSheet";
import { SkeletonAvatar, SkeletonText } from "@/src/components/ui/SkeletonLoader";
import { useCurrentProfile } from "@/src/hooks";
import { useGetProfile } from "@/src/services/authApi";
import { useAuth } from "@/src/store/auth/hook";
import { TypographyStyles } from "@/src/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, type FC } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showArrow?: boolean;
  isDestructive?: boolean;
}

const SettingItem: FC<SettingItemProps> = ({
  title,
  iconName,
  onPress,
  showArrow = true,
  isDestructive = false,
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIconWrapper}>
        <Ionicons
          name={iconName}
          size={18}
          color={isDestructive ? "#dc3545" : "#333"}
        />
      </View>

      <Text
        style={[styles.settingText, isDestructive && styles.destructiveText]}
      >
        {title}
      </Text>
    </View>

    {showArrow && (
      <Ionicons name="chevron-forward-outline" size={16} color="#ccc" />
    )}
  </TouchableOpacity>
);

export default function ProfileTab() {
  const { userProfile, updateUserProfile, signOut } = useAuth();
  const router = useRouter();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);

  // Require authentication - automatically redirects to login if not authenticated
  const { isLoggedIn } = useCurrentProfile();

  // Social links (only the three requested)
  const handleLinkedIn = () => Linking.openURL("https://www.linkedin.com/in/oneplatforms");
  const handleFacebookEnutrition = () => Linking.openURL("https://www.facebook.com/enutrition.me");
  const handleYouTube = () => Linking.openURL("https://www.youtube.com/@e.nutrition");

  const {
    mutate: fetchProfile,
    data: profileData,
    isPending: profileLoading,
    error: profileError,
  } = useGetProfile();

  useEffect(() => {
    fetchProfile(undefined, {
      onSuccess: (data) => {
      },
      onError: (error: any) => {
        const status = error?.response?.status;

        if (status === 401) {
          signOut();
        }
      },
    });
  }, [fetchProfile, signOut]);

  useEffect(() => {
    if (profileData) {
      updateUserProfile({
        username: profileData.username,
        email: profileData.email,
        ...(profileData.profileImage && {
          profileImage: profileData.profileImage,
        }),
      });
    }
  }, [profileData, updateUserProfile]);

  const handleImagePicker = useCallback(async () => {
    Alert.alert(
      "Update Profile Picture",
      "Image picker functionality will be available when expo-image-picker is installed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use Demo Image",
          onPress: () => {
            updateUserProfile({
              profileImage: "https://i.pravatar.cc/200?img=1",
            });
          },
        },
      ]
    );
  }, [updateUserProfile]);

  const handleEditProfile = useCallback(() => {
    router.push("/profile/edit");
  }, [router]);

  const handleChangePassword = useCallback(() => {
    router.push("/profile/change-password");
  }, [router]);

  const handlePrivacy = useCallback(() => {
    router.push("/profile/privacy");
  }, [router]);
  const handleRateApp = () => {
    Linking.openURL(
      Platform.OS === "android"
        ? "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"
        : "https://apps.apple.com/app/idYOUR_APP_ID"
    );
  };

  const handleTerms = useCallback(() => {
    router.push("/legal/terms");
  }, [router]);

  const handlePrivacyPolicy = useCallback(() => {
    router.push("/legal/privacy");
  }, [router]);

  const handleLogout = useCallback(() => {
    setShowLogoutSheet(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setShowLogoutSheet(false);
    await signOut();
    router.replace("/auth/sign-in");
  }, [signOut, router]);

  // Don't render profile if loading or not authenticated (will redirect)
  if (!isLoggedIn) {
    return router.replace('/auth/sign-in');
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileStack}>
              {/* Left Side - Profile Image or Username Initial */}
              <View style={styles.leftSection}>
                {profileLoading ? (
                  <SkeletonAvatar size={70} style={styles.skeletonAvatar} />
                ) : (() => {
                  const imageUri = profileData?.profileImage || userProfile.profileImage;
                  const username = profileData?.username || userProfile?.username || "User";

                  if (imageUri) {
                    return (
                      <Pressable onPress={handleImagePicker} style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.profileImageStack} />
                      </Pressable>
                    );
                  } else {
                    // Show username initial in a circle
                    const initial = username.charAt(0).toUpperCase();
                    return (
                      <Pressable onPress={handleImagePicker} style={styles.imageContainer}>
                        <View style={styles.usernameInitial}>
                          <Text style={styles.initialText}>{initial}</Text>
                        </View>
                      </Pressable>
                    );
                  }
                })()}
              </View>

              {/* Right Side - User Info */}
              <View style={styles.rightSection}>
                {profileLoading ? (
                  <View style={styles.skeletonContainer}>
                    <SkeletonText width="60%" height={20} style={{ marginBottom: 8 }} />
                    <SkeletonText width="80%" height={14} />
                  </View>
                ) : profileError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load profile</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.userName} numberOfLines={1}>
                      {profileData?.username || userProfile?.username || "User"}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {profileData?.email || userProfile.email}
                    </Text>
                  </>
                )}
              </View>
            </View>
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
            <View style={styles.divider} />

            <SettingItem
              title="Terms & Conditions"
              iconName="document-text-outline"
              onPress={handleTerms}
            />
            <View style={styles.divider} />

            <SettingItem
              title="Privacy Policy"
              iconName="shield-checkmark-outline"
              onPress={handlePrivacyPolicy}
            />
            <View style={styles.divider} />

            <SettingItem
              title="Rate on Play Store"
              iconName="star-outline"
              onPress={handleRateApp}
            />
            {/* <View style={styles.divider} />  
            <SettingItem
              title="Privacy"
              iconName="shield-outline"
              onPress={handlePrivacy}
            /> */}
          </View>
        </View>
        <View style={styles.settingsSection}>
          <View style={styles.settingsList}>
            <SettingItem
              title="LinkedIn"
              iconName="logo-linkedin"
              onPress={handleLinkedIn}
            />
            <View style={styles.divider} />

            <SettingItem
              title="Facebook"
              iconName="logo-facebook"
              onPress={handleFacebookEnutrition}
            />
            <View style={styles.divider} />

            <SettingItem
              title="YouTube"
              iconName="logo-youtube"
              onPress={handleYouTube}
            />
          </View>
        </View>
        <View style={styles.settingsSection}>
          <View style={styles.settingsList}>
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
    backgroundColor: "#fff",
  },
  settingIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDEDED", // Soft modern gray
    borderColor: "#C7C7C7",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    zIndex: 10,
  },
  headerTitle: {
    ...TypographyStyles.h2,
    fontSize: 28,
    color: "#000",
    letterSpacing: -0.5,
  },
  userSection: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  profileCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  profileStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftSection: {
    marginRight: 16,
  },
  rightSection: {
    flex: 1,
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageStack: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  usernameInitial: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#00994C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initialText: {
    ...TypographyStyles.h2,
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#00994C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    alignItems: "center",
    width: "100%",
  },
  userName: {
    ...TypographyStyles.h2,
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    // marginBottom: 8,
    letterSpacing: -0.3,
    textAlign: "left",
  },
  userEmail: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: "#666",
    marginTop: 0,
    textAlign: "left",
    fontWeight: "400",
  },

  settingsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 8,
    // borderWidth: 1,
    // borderColor: '#000',
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
    // color: '#000',
  },
  settingText: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: "#000",
  },
  destructiveText: {
    color: "#dc3545",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 20,
    marginRight: 20,
  },
  skeletonContainer: {
    justifyContent: "center",
  },
  skeletonAvatar: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  errorText: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: "#dc3545",
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#00994C",
    borderRadius: 6,
  },
  retryText: {
    ...TypographyStyles.body,
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});
