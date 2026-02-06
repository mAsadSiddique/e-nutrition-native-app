import React, { useMemo } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

export interface RecommendedItem {
  id: number;
  title: string;
  description?: string;
  image?: { uri?: string } | string;
}

interface Props {
  items: RecommendedItem[];
  onPress?: (item: RecommendedItem) => void;
  title?: string;
  padding?: number;
  gap?: number;
  visible?: number; // how many cards visible at once (default 2)
}

export default function RecommendedRow({
  items,
  onPress,
  title = "Recommended Blogs",
  padding = 16,
  gap = 12,
  visible = 2,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();

  if (!Array.isArray(items) || items.length === 0) return null;

  // Limit container width for very large screens so cards remain reasonable
  const containerWidth = Math.min(windowWidth, 1100);
  const cardWidth = useMemo(() => {
    // Compute available width and split it into `visible` cards with `gap` spacing
    const available = Math.max(
      containerWidth - padding * 2 - gap * (visible - 1),
      320,
    );
    const w = Math.floor(available / visible);
    // Keep card sizes within reasonable bounds for responsiveness
    return Math.max(220, Math.min(420, w));
  }, [containerWidth, padding, gap, visible]);

  const snapInterval = cardWidth + gap;

  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingLeft: padding, paddingRight: padding + gap },
        ]}
        style={{ width: "100%" }}
        scrollEventThrottle={16}
      >
        {items.map((it, idx) => (
          <TouchableOpacity
            key={it.id}
            activeOpacity={0.8}
            onPress={() => onPress?.(it)}
            style={[
              styles.card,
              {
                width: cardWidth,
                marginRight: idx === items.length - 1 ? 0 : gap,
              },
            ]}
          >
            <View style={styles.imageWrapper}>
              {it.image ? (
                <Image
                  source={
                    typeof it.image === "string" ? { uri: it.image } : it.image
                  }
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
              )}
            </View>
            <View style={styles.cardText}>
              <Text
                style={styles.cardTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {it.title}
              </Text>
              {it.description ? (
                <Text
                  style={styles.cardDesc}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {it.description}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  scrollContainer: {
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    // elevation / shadow for visual separation
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 3 },
      default: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 16 / 10,
    backgroundColor: "#f3f3f3",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "#eee",
  },
  cardText: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
