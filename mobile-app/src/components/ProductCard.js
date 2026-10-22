import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useCart } from '../context/CartContext';
import { wishlistAPI } from '../services/api';

const ProductCard = ({ product, onPress, onWishlistChange }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const productId = product._id || product.id;
  const [isWishlisted, setIsWishlisted] = useState(false);

  const cartItem = items.find((i) => (i.product._id || i.product.id) === productId);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const price = product.discountPrice || product.price || 0;
  const originalPrice = product.price || 0;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  useEffect(() => {
    checkWishlist();
  }, [productId]);

  const checkWishlist = async () => {
    try {
      const inWishlist = await wishlistAPI.isInWishlist(productId);
      setIsWishlisted(inWishlist);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleWishlist = async (e) => {
    try {
      if (isWishlisted) {
        await wishlistAPI.removeFromWishlist(productId);
        setIsWishlisted(false);
        if (onWishlistChange) onWishlistChange(productId, false);
      } else {
        await wishlistAPI.addToWishlist(product);
        setIsWishlisted(true);
        if (onWishlistChange) onWishlistChange(productId, true);
      }
    } catch (err) {
      console.warn('Wishlist toggle error:', err);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress && onPress(product)}
    >
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🥦</Text>
          </View>
        )}
        {product.shelfLifeDays ? (
          <View style={styles.shelfLifeBadge}>
            <Text style={styles.shelfLifeText}>⏱ {product.shelfLifeDays}d Shelf Life</Text>
          </View>
        ) : null}

        {/* Wishlist Heart Button */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={handleToggleWishlist}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.wishlistIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand || 'Fresh'}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>{product.unit || '1 unit'}</Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>₹{price}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>

          {qtyInCart > 0 ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => updateQuantity(productId, qtyInCart - 1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepQty}>{qtyInCart}</Text>
              <TouchableOpacity
                onPress={() => addToCart(product, 1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(product, 1)}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#f3f4f6',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  shelfLifeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shelfLifeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  wishlistIcon: {
    fontSize: 14,
  },
  content: {
    padding: spacing.sm,
  },
  brand: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
    height: 34,
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  originalPrice: {
    fontSize: 11,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addBtnText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepQty: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});

export default ProductCard;
