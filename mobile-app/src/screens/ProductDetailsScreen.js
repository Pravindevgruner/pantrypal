import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import dayjs from 'dayjs';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { expiryAPI } from '../services/api';

const ProductDetailsScreen = ({ navigation, route }) => {
  const { product } = route.params || {};
  const { addToCart } = useCart();
  const { isAuthenticated, quickDemoLogin } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [addingToPantry, setAddingToPantry] = useState(false);
  const [pantryAdded, setPantryAdded] = useState(false);

  if (!product) {
    return (
      <View style={styles.container}>
        <Header title="Product Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found</Text>
        </View>
      </View>
    );
  }

  const shelfLife = product.shelfLifeDays || 7;
  const estimatedExpiry = dayjs().add(shelfLife, 'day').format('DD MMM YYYY');
  const price = product.discountPrice || product.price || 0;
  const originalPrice = product.price || 0;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const categoryName = typeof product.category === 'string'
    ? product.category
    : product.categoryName || product.category?.name || 'Grocery';
  const categoryStr = categoryName.toLowerCase();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert('Added to Cart', `${quantity}x ${product.name} added to your basket.`);
  };

  const handleAddToPantry = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please sign in to track household groceries.',
        [
          { text: 'Quick Demo Login', onPress: () => quickDemoLogin('customer') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      setAddingToPantry(true);
      await expiryAPI.addExpiryItem({
        itemName: product.name,
        category: categoryName,
        purchasedDate: new Date().toISOString(),
        shelfLifeDays: shelfLife,
        quantity: quantity,
        unit: product.unit || 'unit',
        location: categoryStr.includes('dairy') ||
                  categoryStr.includes('meat') ||
                  categoryStr.includes('veg') ||
                  categoryStr.includes('fruit')
                    ? 'Fridge'
                    : 'Pantry',
        notes: `Catalog item: ${product.brand || ''} ${product.name}`,
      });
      setPantryAdded(true);
      Alert.alert(
        'Added to Household Pantry! 🎉',
        `${product.name} is now tracked with ${shelfLife} days shelf life. You will receive expiry alerts before it spoils.`
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add item to pantry');
    } finally {
      setAddingToPantry(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={product.name}
        showBack
        onBack={() => navigation.goBack()}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>🥦</Text>
            </View>
          )}

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.detailsCard}>
          <Text style={styles.brand}>{product.brand || 'Fresh Produce'}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.unit}>{product.unit || '1 Pack'} • {categoryName}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price}</Text>
            {hasDiscount && <Text style={styles.originalPrice}>₹{originalPrice}</Text>}
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : 'In Stock'}
              </Text>
            </View>
          </View>
        </View>

        {/* Smart Expiry Forecast Box */}
        <View style={styles.expiryBox}>
          <View style={styles.expiryHeader}>
            <Text style={styles.expiryIcon}>⏱️</Text>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.expiryTitle}>Smart Expiry Forecast</Text>
              <Text style={styles.expirySub}>Estimated shelf-life calculated automatically</Text>
            </View>
          </View>

          <View style={styles.expiryGrid}>
            <View style={styles.expiryStat}>
              <Text style={styles.statLabel}>Shelf Life</Text>
              <Text style={styles.statValue}>{shelfLife} Days</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.expiryStat}>
              <Text style={styles.statLabel}>Est. Expiry Date</Text>
              <Text style={styles.statValue}>{estimatedExpiry}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.expiryStat}>
              <Text style={styles.statLabel}>Perishability</Text>
              <Text style={[styles.statValue, { color: shelfLife <= 4 ? colors.danger : colors.primaryDark }]}>
                {shelfLife <= 4 ? 'High' : 'Normal'}
              </Text>
            </View>
          </View>

          <View style={styles.storageTip}>
            <Text style={styles.tipText}>
              💡 Tip: {categoryStr.includes('dairy')
                ? 'Store at 4°C in the main refrigerator compartment.'
                : categoryStr.includes('fruit') || categoryStr.includes('veg')
                ? 'Keep in crisper drawer to maintain optimal humidity and freshness.'
                : 'Keep sealed in a cool, dry place away from direct sunlight.'}
            </Text>
          </View>
        </View>

        {/* Direct Household Inventory Button */}
        <TouchableOpacity
          style={[styles.pantryBtn, pantryAdded && styles.pantryBtnSuccess]}
          onPress={handleAddToPantry}
          disabled={addingToPantry}
        >
          <Text style={styles.pantryBtnText}>
            {pantryAdded
              ? '✓ Tracked in Household Pantry'
              : addingToPantry
              ? 'Adding to Pantry...'
              : '🏠 Add Directly to Household Pantry'}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.descCard}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.descText}>
            {product.description ||
              'Freshly sourced quality groceries directly from certified farms and trusted suppliers. Quality checked, sanitized, and safely packaged for your household.'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.stepBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepQty}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartBtnText}>Add to Cart • ₹{price * quantity}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    height: 260,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  unit: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: spacing.sm,
  },
  stockBadge: {
    marginLeft: 'auto',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  expiryBox: {
    backgroundColor: '#fffbeb',
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  expiryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  expiryIcon: {
    fontSize: 24,
  },
  expiryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  expirySub: {
    fontSize: 11,
    color: '#b45309',
  },
  expiryGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  expiryStat: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  storageTip: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(254, 243, 199, 0.5)',
    padding: spacing.sm,
    borderRadius: 6,
  },
  tipText: {
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
  },
  pantryBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  pantryBtnSuccess: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  pantryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  descCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  descText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    elevation: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  stepBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepQty: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 8,
  },
  cartButton: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});

export default ProductDetailsScreen;
