import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface YouTubePreviewProps {
  videoId: string;
  url: string;
  title?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function YouTubePreview({ videoId, url, title }: YouTubePreviewProps) {
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Calculate player height based on screen width (16:9 aspect ratio)
  const playerHeight = Math.floor((SCREEN_WIDTH - 32) * (9 / 16)); // 32 for padding

  const handleStateChange = (state: string) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  };

  const handleError = (error: string) => {
    console.error('YouTube player error:', error);
    setHasError(true);
  };

  if (hasError) {
    // Fallback: Show a message with link to open in browser
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={24} color="#FF0000" style={styles.errorIcon} />
        <Text style={styles.errorText}>
          Unable to load video. Please check your connection.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.playerContainer}>
        <YoutubePlayer
          height={playerHeight}
          width={SCREEN_WIDTH - 32} // Account for container padding
          videoId={videoId}
          play={playing}
          onChangeState={handleStateChange}
          onError={handleError}
          webViewStyle={styles.webView}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
          }}
        />
      </View>
      {title && (
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      )}
      <View style={styles.footer}>
        <Ionicons name="logo-youtube" size={16} color="#FF0000" style={styles.footerIcon} />
        <Text style={styles.footerText}>YouTube</Text>
      </View>
    </View>
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
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: '#000',
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
  },
  footerIcon: {
    marginRight: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
  },
});

