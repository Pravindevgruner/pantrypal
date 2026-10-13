import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { productAPI } from '../services/api';

const CategoriesScreen = ({ navigation, route }) => {
  const initialCategory = route?.params?.selectedCategory || 'ALL';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  const loadCategoriesAndProducts = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getProducts(),
      ]);
      setCategories(catRes.data?.categories || catRes.data || []);
      setProducts(prodRes.data?.products || prodRes.data || []);
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter(
          (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <View style={styles.container}>
      <Header title="Grocery Categories" navigation={navigation} />

      {/* Horizontal Category Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCategory === 'ALL' && styles.activeChip,
            ]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === 'ALL' && styles.activeChipText,
              ]}
            >
              All Items ({products.length})
            </Text>
          </TouchableOpacity>

          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat._id || idx}
              style={[
                styles.chip,
                selectedCategory.toLowerCase() === (cat.name || '').toLowerCase() &&
                  styles.activeChip,
              ]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory.toLowerCase() === (cat.name || '').toLowerCase() &&
                    styles.activeChipText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No items in this category</Text>
            <Text style={styles.emptySub}>Please check back soon for fresh arrivals!</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((p) => (
              <View key={p._id || p.id} style={{ width: '50%' }}>
                <ProductCard
                  product={p}
                  onPress={(item) =>
                    navigation.navigate('ProductDetails', { product: item })
                  }
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chipsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: spacing.sm,
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeChipText: {
    color: '#ffffff',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});

export default CategoriesScreen;
