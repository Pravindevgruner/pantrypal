import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { productAPI, expiryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { user, isAuthenticated, quickDemoLogin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productAPI.getProducts(),
        productAPI.getCategories(),
      ]);

      const pList = prodRes.data?.data?.products || prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []);
      const cList = catRes.data?.data?.categories || catRes.data?.categories || (Array.isArray(catRes.data) ? catRes.data : []);
      setProducts(Array.isArray(pList) ? pList : []);
      setCategories(Array.isArray(cList) ? cList : []);

      if (isAuthenticated) {
        try {
          const expRes = await expiryAPI.getExpiringSoon();
          const items = expRes.data?.data?.items || expRes.data?.items || [];
          setExpiringCount(items.length);
        } catch (e) {
          // Expiry fetch fallback
        }
      }
    } catch (err) {
      console.warn('Error loading home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const productList = Array.isArray(products) ? products : [];
  const categoryList = Array.isArray(categories) ? categories : [];
  const filteredProducts = productList.filter((p) => {
    const catName = typeof p.category === 'string' ? p.category : p.category?.name || '';
    return (
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      catName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <Header
        title={isAuthenticated ? `Hi, ${user?.name?.split(' ')[0] || 'Friend'} 👋` : 'PantryPal 🛒'}
        subtitle="Deliver to: 12th Cross, Indiranagar"
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Unauthenticated Demo Quick-Login Banner */}
        {!isAuthenticated && (
          <View style={styles.demoBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoTitle}>⚡ Quick Demo Access</Text>
              <Text style={styles.demoSub}>Sign in with 1-tap to test Cart, Orders & Smart Expiry</Text>
            </View>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => quickDemoLogin('customer')}
            >
              <Text style={styles.demoBtnText}>Login as Customer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search fresh veggies, fruits, dairy..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Smart Expiry Reminder Widget */}
        <TouchableOpacity
          style={styles.expiryCard}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('SmartExpiry')}
        >
          <View style={styles.expiryLeft}>
            <View style={styles.bellIconBox}>
              <Text style={styles.bellEmoji}>⏱️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.expiryTitle}>Smart Expiry Tracker</Text>
              <Text style={styles.expirySubtitle}>
                {isAuthenticated
                  ? expiringCount > 0
                    ? `${expiringCount} item(s) expiring soon! Consume before they spoil.`
                    : 'All household items are fresh. Track pantry items now.'
                  : 'Track shelf life, get spoilage reminders, stop food waste.'}
              </Text>
            </View>
          </View>
          <View style={styles.expiryAction}>
            <Text style={styles.expiryActionText}>Open Tracker →</Text>
          </View>
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={{ flex: 1 }}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>TODAY'S SPECIAL</Text>
            </View>
            <Text style={styles.promoTitle}>Farm Fresh Organics</Text>
            <Text style={styles.promoSub}>Up to 30% OFF on fresh fruits & greens</Text>
          </View>
          <Text style={styles.promoEmoji}>🥑🍎</Text>
        </View>

        {/* Categories Bar */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {categoryList.map((cat, idx) => (
            <TouchableOpacity
              key={cat._id || idx}
              style={styles.catItem}
              onPress={() => navigation.navigate('Categories', { selectedCategory: cat.name })}
            >
              <View style={styles.catIconBox}>
                <Text style={styles.catEmoji}>
                  {cat.name?.toLowerCase().includes('fruit') ? '🍎' :
                   cat.name?.toLowerCase().includes('veg') ? '🥦' :
                   cat.name?.toLowerCase().includes('dairy') ? '🥛' :
                   cat.name?.toLowerCase().includes('bakery') ? '🍞' :
                   cat.name?.toLowerCase().includes('snack') ? '🍿' : '🥗'}
                </Text>
              </View>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Search Results (${filteredProducts.length})` : 'Popular Fresh Groceries'}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySub}>Try searching with different keywords</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <View key={product._id || product.id} style={{ width: '50%' }}>
                <ProductCard
                  product={product}
                  onPress={(p) => navigation.navigate('ProductDetails', { product: p })}
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  demoBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
  },
  demoSub: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 2,
  },
  demoBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  clearText: {
    fontSize: 14,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  expiryCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  expiryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellEmoji: {
    fontSize: 20,
  },
  expiryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  expirySubtitle: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
  },
  expiryAction: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
  },
  expiryActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
  promoBanner: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 14,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  promoSub: {
    fontSize: 12,
    color: colors.primaryDark,
    marginTop: 2,
  },
  promoEmoji: {
    fontSize: 42,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  categoriesRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  catItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 68,
  },
  catIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  catEmoji: {
    fontSize: 24,
  },
  catName: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
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

export default HomeScreen;
