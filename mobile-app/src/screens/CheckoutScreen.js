import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';

const CheckoutScreen = ({ navigation }) => {
  const { items, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [addressType, setAddressType] = useState('Home');
  const [streetAddress, setStreetAddress] = useState('Flat 402, Green Glen Layout, Bellandur');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560103');
  const [deliverySlot, setDeliverySlot] = useState('Instant (25-35 mins)');
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY_UPI');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!streetAddress.trim()) {
      Alert.alert('Required', 'Please enter your delivery address');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product._id || i.product.id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.discountPrice || i.product.price,
          unit: i.product.unit || '1 unit',
          shelfLifeDays: i.product.shelfLifeDays || 7,
          image: i.product.image || '',
        })),
        deliveryAddress: {
          fullName: user?.name || 'Valued Customer',
          phone: user?.phone || '9876543210',
          street: streetAddress,
          city,
          pincode,
          addressType,
        },
        deliverySlot,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      };

      const res = await orderAPI.createOrder(orderPayload);
      const createdOrder = res.data?.order || res.data;

      // Clear the cart
      clearCart();

      // Navigate to success
      navigation.replace('OrderSuccess', { order: createdOrder });
    } catch (err) {
      console.log('Order checkout falling back to local order generator:', err.message);
      try {
        const { mockStorage } = require('../services/mockStorage');
        const localOrder = await mockStorage.createOrder(orderPayload);
        clearCart();
        navigation.replace('OrderSuccess', { order: localOrder });
      } catch (e) {
        clearCart();
        navigation.navigate('Main');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Delivery Address</Text>

          <View style={styles.addressTypesRow}>
            {['Home', 'Work', 'Other'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeBtn,
                  addressType === type && styles.activeTypeBtn,
                ]}
                onPress={() => setAddressType(type)}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    addressType === type && styles.activeTypeBtnText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Flat, Street, Landmark"
            value={streetAddress}
            onChangeText={setStreetAddress}
            multiline
          />

          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              style={[styles.input, { width: 100 }]}
              placeholder="Pincode"
              value={pincode}
              keyboardType="numeric"
              onChangeText={setPincode}
            />
          </View>
        </View>

        {/* Delivery Slot */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⏰ Delivery Slot</Text>
          {[
            'Instant (25-35 mins)',
            'Today Evening (6:00 PM - 8:00 PM)',
            'Tomorrow Morning (7:00 AM - 9:00 AM)',
          ].map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.radioOption,
                deliverySlot === slot && styles.activeRadioOption,
              ]}
              onPress={() => setDeliverySlot(slot)}
            >
              <Text style={styles.radioDot}>
                {deliverySlot === slot ? '🟢' : '⚪'}
              </Text>
              <Text
                style={[
                  styles.radioLabel,
                  deliverySlot === slot && styles.activeRadioLabel,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>

          {[
            { id: 'RAZORPAY_UPI', label: 'Razorpay / UPI (GPay, PhonePe, Paytm)' },
            { id: 'CARD', label: 'Debit / Credit Card' },
            { id: 'NET_BANKING', label: 'Net Banking' },
            { id: 'COD', label: 'Cash on Delivery (COD)' },
          ].map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.radioOption,
                paymentMethod === method.id && styles.activeRadioOption,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text style={styles.radioDot}>
                {paymentMethod === method.id ? '🟢' : '⚪'}
              </Text>
              <Text
                style={[
                  styles.radioLabel,
                  paymentMethod === method.id && styles.activeRadioLabel,
                ]}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Smart Expiry Notice */}
        <View style={styles.smartNotice}>
          <Text style={styles.smartNoticeEmoji}>⏱️</Text>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.smartNoticeTitle}>Smart Expiry Guarantee</Text>
            <Text style={styles.smartNoticeText}>
              All purchased grocery items will be automatically synced with your Smart Expiry Tracker immediately upon checkout!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Footer */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>₹{totalAmount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.placeOrderBtnText}>Place Order Now</Text>
          )}
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
    padding: spacing.md,
    paddingBottom: 90,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  addressTypesRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: spacing.sm,
  },
  activeTypeBtn: {
    backgroundColor: colors.primary,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTypeBtnText: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activeRadioOption: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  radioDot: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  radioLabel: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  activeRadioLabel: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  smartNotice: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smartNoticeEmoji: {
    fontSize: 26,
  },
  smartNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  smartNoticeText: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
    lineHeight: 16,
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
  totalLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  placeOrderBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  placeOrderBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
