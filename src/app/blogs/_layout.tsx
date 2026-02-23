import { useGetCategoriesWithChildren, type Category } from '@/src/services/categoryApi';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Header title component that fetches and displays category name
function BlogHeaderTitle() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { data: categoriesWithChildren } = useGetCategoriesWithChildren();

  const categoryName = useMemo(() => {
    if (!categoryId || !categoriesWithChildren) return 'Article';
    
    const categoryIdNum = Number(categoryId);
    const findCategory = (cats: Category[]): Category | null => {
      for (const cat of cats) {
        if (cat.id === categoryIdNum) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const foundCategory = findCategory(categoriesWithChildren);
    return foundCategory?.name || 'Article';
  }, [categoryId, categoriesWithChildren]);

  return (
    <View style={{ marginLeft: 32 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#000', letterSpacing: -0.5 }}>
        {categoryName}
      </Text>
    </View>
  );
}

export default function BlogsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[blogId]/[categoryId]/[slug]"
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: () => <BlogHeaderTitle />,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack>
  );
}

