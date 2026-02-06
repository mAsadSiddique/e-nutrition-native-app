import { TypographyStyles } from "@/src/theme/theme";
import {
  ParsedElement,
  parseHtmlContent,
  TextSegment,
} from "@/src/utils/htmlParser";
import { Image } from "expo-image";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
import React from "react";
import {
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YouTubePreview from "./YouTubePreview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HtmlContentRendererProps {
  html: string;
  media?: any;
}

export default function HtmlContentRenderer({
  html,
  media,
}: HtmlContentRendererProps) {
  const elements = React.useMemo(() => {
    try {
      return parseHtmlContent(html || "", media);
    } catch (error) {
      console.error("Error parsing HTML content:", error);
      return [];
    }
  }, [html, media]);

  const handleLinkPress = async (href: string) => {
    try {
      const canOpen = await Linking.canOpenURL(href);
      if (canOpen) {
        await openBrowserAsync(href, {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        });
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  const renderFormattedText = (segments: TextSegment[], baseStyle: any) => {
    return (
      <Text style={baseStyle}>
        {segments.map((segment, segIndex) => {
          const segmentStyles = [];
          if (segment.styles?.bold) segmentStyles.push(styles.bold);
          if (segment.styles?.italic) segmentStyles.push(styles.italic);
          if (segment.styles?.underline) segmentStyles.push(styles.underline);
          if (segment.styles?.code) segmentStyles.push(styles.code);

          return (
            <Text
              key={segIndex}
              style={segmentStyles.length > 0 ? segmentStyles : undefined}
            >
              {segment.text}
            </Text>
          );
        })}
      </Text>
    );
  };

  const stripRemainingTags = (raw: string) => raw.replace(/<[^>]*>/g, "");

  const renderElement = (element: ParsedElement, index: number) => {
    switch (element.type) {
      case "text":
        const textContent = stripRemainingTags(element.content);
        if (!textContent.trim()) return null;
        return (
          <Text key={index} style={styles.text}>
            {textContent}
          </Text>
        );

      case "formattedText":
        if (!element.content.trim()) return null;
        return (
          <Text key={index} style={styles.text}>
            {element.segments?.map((segment, segIndex) => {
              const segmentStyles = [];
              if (segment.styles?.bold) segmentStyles.push(styles.bold);
              if (segment.styles?.italic) segmentStyles.push(styles.italic);
              if (segment.styles?.underline)
                segmentStyles.push(styles.underline);
              if (segment.styles?.code) segmentStyles.push(styles.code);

              return (
                <Text
                  key={segIndex}
                  style={segmentStyles.length > 0 ? segmentStyles : undefined}
                >
                  {segment.text}
                </Text>
              );
            })}
          </Text>
        );

      case "heading":
        const headingStyle =
          element.level === 1
            ? styles.heading1
            : element.level === 2
              ? styles.heading2
              : styles.heading3;

        if (element.segments) {
          // Heading with inline formatting
          return (
            <Text
              key={index}
              style={[headingStyle, index > 0 && styles.headingSpacing]}
            >
              {element.segments.map((segment, segIndex) => {
                const segmentStyles = [];
                if (segment.styles?.bold) segmentStyles.push(styles.bold);
                if (segment.styles?.italic) segmentStyles.push(styles.italic);
                if (segment.styles?.underline)
                  segmentStyles.push(styles.underline);
                if (segment.styles?.code) segmentStyles.push(styles.code);

                return (
                  <Text
                    key={segIndex}
                    style={segmentStyles.length > 0 ? segmentStyles : undefined}
                  >
                    {segment.text}
                  </Text>
                );
              })}
            </Text>
          );
        }

        return (
          <Text
            key={index}
            style={[headingStyle, index > 0 && styles.headingSpacing]}
          >
            {stripRemainingTags(element.content)}
          </Text>
        );

      case "link":
        return (
          <TouchableOpacity
            key={index}
            onPress={() => element.href && handleLinkPress(element.href)}
            activeOpacity={0.7}
          >
            <Text style={styles.link}>
              {element.segments?.length
                ? element.segments.map((segment, segIndex) => {
                    const segStyles = [];
                    if (segment.styles?.bold) segStyles.push(styles.bold);
                    if (segment.styles?.italic) segStyles.push(styles.italic);
                    if (segment.styles?.underline)
                      segStyles.push(styles.underline);
                    if (segment.styles?.code) segStyles.push(styles.code);
                    return (
                      <Text
                        key={segIndex}
                        style={segStyles.length > 0 ? segStyles : undefined}
                      >
                        {segment.text}
                      </Text>
                    );
                  })
                : stripRemainingTags(element.content)}
            </Text>
          </TouchableOpacity>
        );

      case "youtube":
        if (element.youtubeId && element.href) {
          return (
            <YouTubePreview
              key={index}
              videoId={element.youtubeId}
              url={element.href}
              title={element.content}
            />
          );
        }
        // Fallback to regular link if YouTube ID extraction failed
        return (
          <TouchableOpacity
            key={index}
            onPress={() => element.href && handleLinkPress(element.href)}
            activeOpacity={0.7}
          >
            <Text style={styles.link}>{element.content}</Text>
          </TouchableOpacity>
        );

      case "image":
        if (element.src && element.src.trim().length > 0) {
          // Validate URL - must be http, https, data URI, or relative path
          const isValidUrl =
            element.src.startsWith("http") ||
            element.src.startsWith("https") ||
            element.src.startsWith("data:") ||
            element.src.startsWith("/") ||
            element.src.startsWith("./");

          if (isValidUrl) {
            return (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri: element.src }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                  onError={(error) => {
                    console.warn("Failed to load image:", element.src, error);
                  }}
                />
              </View>
            );
          }
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {elements.map((element, index) => renderElement(element, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  text: {
    ...TypographyStyles.body,
    color: "#333",
    marginBottom: 12,
    fontSize: Math.max(15, Math.min(17, SCREEN_WIDTH * 0.042)),
    lineHeight: Math.max(22, Math.min(26, SCREEN_WIDTH * 0.065)),
  },
  heading1: {
    ...TypographyStyles.h1,
    fontSize: Math.max(24, Math.min(28, SCREEN_WIDTH * 0.065)),
    fontWeight: "700",
    color: "#000",
    marginTop: 24,
    marginBottom: 12,
    lineHeight: Math.max(32, Math.min(36, SCREEN_WIDTH * 0.08)),
  },
  heading2: {
    ...TypographyStyles.h2,
    fontSize: Math.max(20, Math.min(24, SCREEN_WIDTH * 0.055)),
    fontWeight: "600",
    color: "#000",
    marginTop: 20,
    marginBottom: 10,
    lineHeight: Math.max(28, Math.min(32, SCREEN_WIDTH * 0.07)),
  },
  heading3: {
    ...TypographyStyles.h3,
    fontSize: Math.max(18, Math.min(20, SCREEN_WIDTH * 0.05)),
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
    lineHeight: Math.max(24, Math.min(28, SCREEN_WIDTH * 0.065)),
  },
  headingSpacing: {
    marginTop: 16,
  },
  link: {
    ...TypographyStyles.body,
    color: "#0066cc",
    textDecorationLine: "underline",
    marginBottom: 12,
    fontSize: Math.max(15, Math.min(17, SCREEN_WIDTH * 0.042)),
  },
  imageContainer: {
    width: "100%",
    marginVertical: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    minHeight: 200,
    maxHeight: 400,
  },
  textContainer: {
    marginBottom: 12,
  },
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecorationLine: "underline",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: Math.max(14, Math.min(16, SCREEN_WIDTH * 0.038)),
  },
});
