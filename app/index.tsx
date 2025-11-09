import { TypographyStyles } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories } from '../utils/data';
const MAX_SELECTION = 3;
const PADDING_HORIZONTAL = 20;
const GAP = 12;

export default function CategorySelectionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (name: string) => {
    setError(null);
    setSelected((prev) => {
      const exists = prev.includes(name);
      if (exists) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_SELECTION) {
        setError(`You can only choose up to ${MAX_SELECTION}.`);
        return prev;
      }
      return [...prev, name];
    });
  };

  const canContinue = selected.length === MAX_SELECTION;

  const renderPill = ({ item, index }: any) => {
    const active = selected.includes(item.name);
    const isEven = index % 2 === 0;
    return (
      <TouchableOpacity
        onPress={() => toggle(item.name)}
        style={[
          styles.pill,
          active && styles.pillActive,
          !isEven && styles.pillRight,
        ]}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: { id: number }) => String(item.id);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>What are you interested in?</Text>
        <Text style={styles.subtitle}>Choose up to 3 categories.</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={categories}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          renderItem={renderPill}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <TouchableOpacity
        disabled={!canContinue}
        onPress={() => router.push({ pathname: '/(tabs)/(home)', params: { selected: JSON.stringify(selected) } })}
        style={[styles.cta, !canContinue && styles.ctaDisabled]}
      >
        <Text style={styles.ctaText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  content: {
    flex: 1,
    paddingTop: 32,
  },
  title: {
    ...TypographyStyles.h2,
    marginBottom: 6,
  },
  subtitle: {
    ...TypographyStyles.body,
    color: '#666',
    marginBottom: 8,
  },
  error: {
    ...TypographyStyles.bodySmall,
    color: '#cc0000',
    marginBottom: 8,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: GAP,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    minHeight: 44,
  },
  pillRight: {
    marginLeft: GAP,
  },
  pillActive: {
    backgroundColor: '#00994C',
    borderColor: '#00994C',
  },
  pillText: {
    ...TypographyStyles.body,
    color: '#222',
    textAlign: 'center',
  },
  pillTextActive: {
    ...TypographyStyles.body,
    color: '#fff',
    fontWeight: '600',
  },
  cta: {
    backgroundColor: '#00994C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
    minHeight: 52,
  },
  ctaDisabled: {
    backgroundColor: '#80cc9f',
  },
  ctaText: {
    ...TypographyStyles.body,
    color: '#fff',
    fontWeight: '600',
  },
});


