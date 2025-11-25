import { TypographyStyles } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blogs } from '../../../utils/data';

export default function SearchTab() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return blogs.filter(
      (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    );
  }, [q]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(tabs)/(home)/${item.id}`)}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.cardDesc}>{item.description}</Text>
        </View>
        <Image source={item.image} style={styles.thumb} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search nutrition articles, recipes"
          value={q}
          onChangeText={setQ}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  input: {
    ...TypographyStyles.body,
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    fontSize:15,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12 },
  cardTitle: { 
    // ...TypographyStyles.h4
     ...TypographyStyles.h2,

    // ...TypographyStyles.body,
    fontSize: 22,
    // fontWeight: '700',
    color: '#000', 
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0,},
  cardDesc: { ...TypographyStyles.body, color: '#666' },
  thumb: { width: 80, height: 80, borderRadius: 10 },
});


