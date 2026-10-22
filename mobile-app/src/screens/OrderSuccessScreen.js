import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../styles/theme';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { order } = route?.params || {};
  const orderId = order?._id || order?.id || 'OD' + Math.floor(100000 + Math.random() * 900000);
  const itemsCount = order?.items?.length || 1;
  const totalAmount = order?.totalAmount || '—';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your fresh groceries are being packed and will be delivered shortly.
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.value} numberOfLines={1}>#{orderId.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Items</Text>
            <Text style={styles.value}>{itemsCount} item(s)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={[styles.value, { color: colors.primaryDark }]}>₹{totalAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Estimated Delivery</Text>
            <Text style={styles.value}>In 25 - 35 mins 🛵</Text>
          </View>
        </View>

        {/* Smart Expiry System Callout */}
        <View style={styles.smartExpiryCallout}>
          <Text style={styles.calloutIcon}>⏱️</Text>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.calloutTitle}>Smart Expiry Activated!</Text>
            <Text style={styles.calloutText}>
              All {itemsCount} grocery item(s) from this order are now monitored in your Household Pantry. You will receive notifications before they expire.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('SmartExpiry')}
        >
          <Text style={styles.primaryBtnText}>View Smart Expiry Tracker →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.secondaryBtnText}>Track Order Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryBtn}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.tertiaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    borderWidth: 3,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkIcon: {
    fontSize: 44,
    color: colors.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  smartExpiryCallout: {
    width: '100%',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  calloutIcon: {
    fontSize: 28,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
  },
  calloutText: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 2,
    lineHeight: 16,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  tertiaryBtn: {
    paddingVertical: 10,
  },
  tertiaryBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OrderSuccessScreen;
