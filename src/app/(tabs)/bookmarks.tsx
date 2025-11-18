import { TypographyStyles } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BookmarksTab() {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.text}>Bookmarks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { ...TypographyStyles.h3 },
});


