import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const WishlistScreen = ({ navigation }) => {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.getWishlist();
      const list = res.data?.data?.wishlist?.products || res.data?.wishlist || [];
      setWishlist(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading wishlist:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch (err) {
      Alert.alert('Error', 'Failed to remove product from wishlist');
    }
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Added to Cart! 🛒', `${product.name} has been added to your shopping basket.`);
  };

  const renderItem = ({ item }) => {
    const productId = item._id || item.id;
    const price = item.discountPrice || item.price || 0;
    const originalPrice = item.price || 0;
    const hasDiscount = item.discountPrice && item.discountPrice < item.price;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.imageBox}
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.placeholderEmoji}>🥦</Text>
          )}
          {item.shelfLifeDays ? (
            <View style={styles.shelfBadge}>
              <Text style={styles.shelfText}>⏱ {item.shelfLifeDays}d Shelf</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.brand} numberOfLines={1}>{item.brand || 'Fresh Produce'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { product: item })}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          </TouchableOpacity>
          <Text style={styles.unit}>{item.unit || '1 unit'}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {hasDiscount && <Text style={styles.originalPrice}>₹{originalPrice}</Text>}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={() => handleMoveToCart(item)}
            >
              <Text style={styles.cartBtnText}>+ Move to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(productId)}
            >
              <Text style={styles.removeBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={`My Wishlist (${wishlist.length})`}
        showBack
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your saved items...</Text>
        </View>
      ) : wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
          <Text style={styles.emptySub}>
            Explore our fresh grocery catalog and tap the heart icon to save products for later!
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.exploreBtnText}>Browse Groceries</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => (item._id || item.id || String(Math.random()))}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadWishlist();
              }}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageBox: {
    width: 110,
    height: 110,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  shelfBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shelfText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '700',
  },
  infoBox: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cartBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cartBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  removeBtn: {
    padding: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default WishlistScreen;
