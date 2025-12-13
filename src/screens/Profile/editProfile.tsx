import AuthButton from "@/src/components/auth/AuthButton";
import { useUser } from "@/src/contexts/UserContext";
import { useGetProfile, useUpdateProfile } from "@/src/services/authApi";
import { TypographyStyles } from "@/src/theme/theme";
import { toast } from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

// Validation schema
const editProfileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
});

type EditProfileFormData = yup.InferType<typeof editProfileSchema>;

export default function EditProfile() {
  const { userProfile, updateProfile } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState(userProfile.email);
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(
    null
  );
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  const { mutate: updateUserProfile, isPending: loading } = useUpdateProfile();
  const { mutate: fetchProfile, data: profileData } = useGetProfile();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted, touchedFields },
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(editProfileSchema),
    defaultValues: {
      name: userProfile.name || "",
    },
    mode: "onChange",
  });


  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileData) {
      setValue("name", profileData.username || "");
      setEmail(profileData.email);
      if (profileData.profileImage && !profileImageUri) {
        setProfileImageUri(profileData.profileImage);
      }
    }
  }, [profileData, profileImageUri, setValue]);

  const handleImagePicker = useCallback(async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.error("Permission to access media library is required!");
        return;
      }

      Alert.alert("Update Profile Picture", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Camera",
          onPress: async () => {
            const cameraResult = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true,
            });

            if (!cameraResult.canceled && cameraResult.assets[0]) {
              const asset = cameraResult.assets[0];
              setProfileImageUri(asset.uri);
              setProfileImageBase64(asset.base64 || null);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true,
            });

            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              setProfileImageUri(asset.uri);
              setProfileImageBase64(asset.base64 || null);
            }
          },
        },
      ]);
    } catch (error) {
      toast.error("Error opening image picker");
    }
  }, []);

  const onSubmit = useCallback(
    async (data: EditProfileFormData) => {
      const profilePayload: any = {
        username: data.name.trim(),
      };

      // Add profile image if selected
      if (profileImageBase64) {
        profilePayload.profileImage = {
          fileBase64: profileImageBase64,
          fileName: "userProfileName",
        };
      }

      updateUserProfile(profilePayload, {
        onSuccess: async (response: any) => {
          // ⭐ 1. Save NEW TOKEN returned by backend
          const newToken = response?.data?.jwt;
          if (newToken) {
            await AsyncStorage.setItem("token", newToken);
          }

          // ⭐ 2. Now call fetchProfile() using the latest token
          fetchProfile();

          // ⭐ 3. Update local context
          updateProfile({
            name: data.name.trim(),
            ...(profileImageUri && { profileImage: profileImageUri }),
          });

          toast.success("Profile updated successfully!");
          router.back();
        },
      });
    },
    [
      profileImageBase64,
      profileImageUri,
      updateUserProfile,
      updateProfile,
      fetchProfile,
      router,
    ]
  );

  const renderProfileImage = () => {

    if (profileImageUri) {
      return (
        <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
      );
    }

    // Show current profile image
    if (userProfile.profileImage) {
      return (
        <Image
          source={{ uri: userProfile.profileImage }}
          style={styles.profileImage}
        />
      );
    }

    return (
      <View style={styles.profileImagePlaceholder}>
        <Ionicons name="person" size={40} color="#ccc" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  editable={!loading}
                />
              )}
            />
            {(isSubmitted || touchedFields.name) && errors.name && (
              <Text style={[styles.validationText, styles.invalidText]}>
                ✗ {errors.name.message}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />
            <Text style={styles.inputHint}>Email cannot be changed</Text>
          </View>

          <AuthButton
            text="Save Changes"
            onPress={handleSubmit(onSubmit)}
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
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...TypographyStyles.h2,
    fontSize: 20,
    color: "#000",
    fontWeight: "600",
  },
  headerSpacer: {
    width: 32,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  imageHint: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: "#666",
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...TypographyStyles.body,
    color: "#222",
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    ...TypographyStyles.body,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#222",
  },
  disabledInput: {
    backgroundColor: "#f8f8f8",
    color: "#666",
  },
  inputHint: {
    ...TypographyStyles.body,
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  validationText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  invalidText: {
    color: "#dc3545",
  },
});
