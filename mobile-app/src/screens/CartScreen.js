import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartScreen = ({ navigation }) => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, totalAmount } = useCart();
  const { isAuthenticated, quickDemoLogin } = useAuth();

  const freeDeliveryThreshold = 499;
  const neededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please sign in to proceed with checkout.',
        [
          { text: '1-Tap Demo Login', onPress: () => quickDemoLogin('customer') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Shopping Cart"
        rightAction={
          items.length > 0 ? (
            <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Discover fresh fruits, vegetables, dairy, and household essentials.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Free Delivery Bar */}
            <View style={styles.deliveryProgressCard}>
              <Text style={styles.deliveryProgressText}>
                {neededForFreeDelivery > 0
                  ? `Add ₹${neededForFreeDelivery} more to enjoy FREE delivery!`
                  : '🎉 You have unlocked FREE delivery!'}
              </Text>
            </View>

            {/* Cart Items List */}
            <View style={styles.itemsCard}>
              {items.map((item) => {
                const p = item.product;
                const productId = p._id || p.id;
                const price = p.discountPrice || p.price || 0;

                return (
                  <View key={productId} style={styles.cartRow}>
                    {p.image ? (
                      <Image source={{ uri: p.image }} style={styles.productImg} />
                    ) : (
                      <View style={styles.placeholderImg}>
                        <Text style={{ fontSize: 22 }}>🥦</Text>
                      </View>
                    )}

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.itemUnit}>{p.unit || '1 unit'} • ₹{price} each</Text>
                      <Text style={styles.itemTotal}>₹{price * item.quantity}</Text>
                    </View>

                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(productId, item.quantity - 1)}
                      >
                        <Text style={styles.stepBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepQty}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(productId, item.quantity + 1)}
                      >
                        <Text style={styles.stepBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Bill Summary */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Details</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{subtotal}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Partner Fee</Text>
                <Text style={[styles.billValue, deliveryFee === 0 && { color: colors.primary }]}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billRow}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalValue}>₹{totalAmount}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Checkout Button Footer */}
          <View style={styles.footerBar}>
            <View>
              <Text style={styles.footerSub}>TOTAL TO PAY</Text>
              <Text style={styles.footerTotal}>₹{totalAmount}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleProceedToCheckout}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingBottom: 90,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  shopBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  deliveryProgressCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  deliveryProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  itemUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  stepQty: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 6,
  },
  billCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  billLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    elevation: 10,
  },
  footerSub: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default CartScreen;
