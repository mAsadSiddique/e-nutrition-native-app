import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base skeleton component with shimmer animation
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E0E0E0',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#F5F5F5',
            width: '50%',
            transform: [{ translateX }],
            opacity: 0.8,
          },
        ]}
      />
    </View>
  );
}

/**
 * Rectangular skeleton for images
 */
export function SkeletonImage({
  width = '100%',
  height = 200,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
}

/**
 * Circular skeleton for avatars
 */
export function SkeletonAvatar({
  size = 40,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

/**
 * Text line skeleton
 */
export function SkeletonText({
  width = '100%',
  height = 16,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={4}
      style={style}
    />
  );
}

/**
 * Multiple text lines skeleton
 */
export function SkeletonTextLines({
  lines = 3,
  lineHeight = 16,
  lineSpacing = 8,
  width = '100%',
  lastLineWidth = '80%',
  style,
}: {
  lines?: number;
  lineHeight?: number;
  lineSpacing?: number;
  width?: number | string;
  lastLineWidth?: number | string;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonText
          key={index}
          width={index === lines - 1 ? lastLineWidth : width}
          height={lineHeight}
          style={{
            marginBottom: index < lines - 1 ? lineSpacing : 0,
          }}
        />
      ))}
    </View>
  );
}

/**
 * Blog card skeleton layout
 */
export function SkeletonBlogCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ paddingHorizontal: 20, paddingVertical: 16 }, style]}>
      <View style={styles.blogCardContent}>
        <View style={styles.blogTextContent}>
          <SkeletonText width="90%" height={22} style={{ marginBottom: 8 }} />
          <SkeletonText width="100%" height={22} style={{ marginBottom: 8 }} />
          <SkeletonText width="70%" height={22} style={{ marginBottom: 8 }} />
          <SkeletonTextLines
            lines={2}
            lineHeight={14}
            lineSpacing={8}
            width="100%"
            lastLineWidth="85%"
            style={{ marginBottom: 12 }}
          />
          <SkeletonText width="40%" height={13} />
        </View>
        <View style={styles.rightColumn}>
          <SkeletonImage width={112} height={112} borderRadius={4} />
          <View style={styles.metaRow}>
            <SkeletonLoader width={36} height={36} borderRadius={18} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

/**
 * Blog detail skeleton layout
 */
export function SkeletonBlogDetail({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ padding: 16 }, style]}>
      <SkeletonText width="95%" height={28} style={{ marginBottom: 8 }} />
      <SkeletonText width="80%" height={28} style={{ marginBottom: 8 }} />
      <SkeletonText width="50%" height={15} style={{ marginBottom: 16 }} />
      <SkeletonImage width="100%" height={250} borderRadius={12} style={{ marginBottom: 16 }} />
      <SkeletonTextLines
        lines={3}
        lineHeight={17}
        lineSpacing={6}
        width="100%"
        lastLineWidth="90%"
        style={{ marginBottom: 6 }}
      />
      <SkeletonTextLines
        lines={3}
        lineHeight={17}
        lineSpacing={6}
        width="100%"
        lastLineWidth="85%"
        style={{ marginBottom: 6 }}
      />
      <SkeletonTextLines
        lines={2}
        lineHeight={17}
        lineSpacing={6}
        width="100%"
        lastLineWidth="75%"
      />
    </View>
  );
}

/**
 * Category pill skeleton
 */
export function SkeletonCategoryPill({ style }: { style?: ViewStyle }) {
  return (
    <SkeletonLoader
      width={80}
      height={32}
      borderRadius={22}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  blogCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  blogTextContent: {
    flex: 1,
    paddingRight: 16,
  },
  rightColumn: {
    width: 112,
    marginLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 16,
  },
});

