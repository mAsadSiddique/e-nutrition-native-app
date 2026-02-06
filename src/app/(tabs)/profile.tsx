import LogoutSheet from "@/src/components/auth/LogoutSheet";
import { useCurrentProfile } from "@/src/hooks";
import { useAuth } from "@/src/store/auth/hook";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { TypographyStyles } from "@/src/theme/theme";
import { AppRoutes, ExternalUrls } from "@/src/utils/enums";
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
  const router = useRouter();
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);

  const { updateUserProfile, signOut } = useAuth();
  const { setBlogsWishlist } = useWishlistHandler();

  // Require authentication - automatically redirects to login if not authenticated
  const { isLoggedIn, userName, profileUrl, email } = useCurrentProfile();

  // Social links (only the three requested)
  const handleLinkedIn = () => Linking.openURL(ExternalUrls.LINKEDIN);
  const handleFacebookEnutrition = () => Linking.openURL(ExternalUrls.FACEBOOK);
  const handleYouTube = () => Linking.openURL(ExternalUrls.YOUTUBE);

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
              profileImage: ExternalUrls.PRAVATAR_DEMO,
            });
          },
        },
      ],
    );
  }, [updateUserProfile]);

  const handleEditProfile = useCallback(() => {
    router.push(AppRoutes.PROFILE_EDIT);
  }, [router]);

  const handleChangePassword = useCallback(() => {
    router.push(AppRoutes.PROFILE_CHANGE_PASSWORD);
  }, [router]);

  const handlePrivacy = useCallback(() => {
    router.push(AppRoutes.PROFILE_PRIVACY);
  }, [router]);
  const handleRateApp = () => {
    Linking.openURL(
      Platform.OS === "android"
        ? ExternalUrls.PLAY_STORE
        : ExternalUrls.APP_STORE,
    );
  };

  const handleTerms = useCallback(() => {
    router.push(AppRoutes.LEGAL_TERMS);
  }, [router]);

  const handlePrivacyPolicy = useCallback(() => {
    router.push(AppRoutes.LEGAL_PRIVACY);
  }, [router]);

  const handleLogout = useCallback(() => {
    setShowLogoutSheet(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setShowLogoutSheet(false);
    await signOut();
    setBlogsWishlist([]);
    router.replace(AppRoutes.AUTH_SIGN_IN);
  }, [signOut, router, setBlogsWishlist]);

  // Redirect to sign-in if not authenticated (useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace(AppRoutes.AUTH_SIGN_IN);
    }
  }, [isLoggedIn, router]);

  // Don't render profile if not authenticated (will redirect)
  if (!isLoggedIn) {
    return null;
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
                {(() => {
                  if (profileUrl) {
                    return (
                      <Pressable
                        onPress={handleImagePicker}
                        style={styles.imageContainer}
                      >
                        <Image
                          source={{ uri: profileUrl }}
                          style={styles.profileImageStack}
                        />
                      </Pressable>
                    );
                  } else {
                    // Show username initial in a circle
                    const initial = userName.charAt(0).toUpperCase();
                    return (
                      <Pressable
                        onPress={handleImagePicker}
                        style={styles.imageContainer}
                      >
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
                <Text style={styles.userName} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {email}
                </Text>
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
