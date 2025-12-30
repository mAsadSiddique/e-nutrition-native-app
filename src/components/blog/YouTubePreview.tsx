import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getYouTubeThumbnail } from '@/src/utils/htmlParser';

interface YouTubePreviewProps {
  videoId: string;
  url: string;
  title?: string;
}

export default function YouTubePreview({ videoId, url, title }: YouTubePreviewProps) {
  const thumbnailUrl = getYouTubeThumbnail(videoId);
  
  const handlePress = async () => {
    try {
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch (error) {
      console.error('Error opening YouTube link:', error);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: thumbnailUrl }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.playButton}>
          <Ionicons name="play-circle" size={48} color="#fff" />
        </View>
      </View>
      {title && (
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      )}
      <View style={styles.footer}>
        <Ionicons name="logo-youtube" size={16} color="#FF0000" />
        <Text style={styles.footerText}>Watch on YouTube</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  title: {
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

