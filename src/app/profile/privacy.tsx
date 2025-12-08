import { TypographyStyles } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PrivacyItemProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const PrivacyItem: React.FC<PrivacyItemProps> = ({ title, description, value, onValueChange }) => (
  <View style={styles.privacyItem}>
    <View style={styles.privacyContent}>
      <Text style={styles.privacyTitle}>{title}</Text>
      <Text style={styles.privacyDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#e0e0e0', true: '#1A8917' }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
    />
  </View>
);

export default function PrivacyScreen() {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    profileVisibility: true,
    nutritionDataSharing: false,
    analyticsTracking: true,
    emailNotifications: true,
    pushNotifications: true,
    locationTracking: false,
  });

  const updateSetting = useCallback((key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Save to backend when ready
    // await updatePrivacySettings({ [key]: value });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Privacy Settings */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Profile Privacy</Text> */}
          
          <View style={styles.settingsList}>
            <PrivacyItem
              title="Public Profile"
              description="Allow others to find and view your nutrition profile"
              value={settings.profileVisibility}
              onValueChange={(value) => updateSetting('profileVisibility', value)}
            />
            <View style={styles.divider} />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>Data Management</Text> */}
          
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.destructiveText]}>Delete Account</Text>
                <Text style={styles.actionDescription}>Permanently delete your account and all data</Text>
              </View>
              <Ionicons name="trash-outline" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#ccc" />
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
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
    borderColor: '#f0f0f0',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  privacyContent: {
    flex: 1,
    paddingRight: 16,
  },
  privacyTitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  privacyDescription: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  actionDescription: {
    ...TypographyStyles.body,
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  destructiveText: {
    color: '#dc3545',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 8,
  },
  linkText: {
    ...TypographyStyles.body,
    fontSize: 16,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
  },
});
