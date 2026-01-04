import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_MAX_WIDTH = SCREEN_WIDTH * 0.8; // 80% of screen width

interface ToastProps {
  text1?: string;
  text2?: string;
}

export const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => (
    <View style={[styles.toast, styles.successToast]}>
      <View style={[styles.iconContainer, styles.successIconContainer]}>
        <Ionicons name="checkmark-circle" size={24} color="#1A8917" />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }: ToastProps) => (
    <View style={[styles.toast, styles.errorToast]}>
      <View style={[styles.iconContainer, styles.errorIconContainer]}>
        <Ionicons name="close-circle" size={24} color="#FF3B30" />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: ToastProps) => (
    <View style={[styles.toast, styles.infoToast]}>
      <View style={[styles.iconContainer, styles.infoIconContainer]}>
        <Ionicons name="information-circle" size={24} color="#007AFF" />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.text1}>{text1}</Text>}
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: 60,
    maxWidth: TOAST_MAX_WIDTH,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
  },
  successToast: {
    borderLeftColor: '#1A8917',
  },
  errorToast: {
    borderLeftColor: '#FF3B30',
  },
  infoToast: {
    borderLeftColor: '#007AFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successIconContainer: {
    backgroundColor: '#E8F5E9',
  },
  errorIconContainer: {
    backgroundColor: '#FFEBEE',
  },
  infoIconContainer: {
    backgroundColor: '#E3F2FD',
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
});

