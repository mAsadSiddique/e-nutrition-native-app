import { TypographyStyles } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categories } from '../utils/data';

const MAX_SELECTION = 3;

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

  const renderPill = ({ item }: any) => {
    const active = selected.includes(item.name);
    return (
      <TouchableOpacity
        onPress={() => toggle(item.name)}
        style={[styles.pill, active && styles.pillActive]}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: { id: number }) => String(item.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>What are you interested in?</Text>
      <Text style={styles.subtitle}>Choose up to 3 categories.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={categories}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderPill}
      />

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
    paddingHorizontal: 20,
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
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pillActive: {
    backgroundColor: '#00994C',
    borderColor: '#00994C',
  },
  pillText: {
    ...TypographyStyles.body,
    color: '#222',
  },
  pillTextActive: {
    ...TypographyStyles.body,
    color: '#fff',
    fontWeight: '600',
  },
  cta: {
    marginTop: 'auto',
    backgroundColor: '#00994C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 24,
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


