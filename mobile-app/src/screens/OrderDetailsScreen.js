import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';

const OrderDetailsScreen = ({ navigation, route }) => {
  const { order } = route.params || {};

  if (!order) {
    return (
      <View style={styles.container}>
        <Header title="Order Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Order not found</Text>
        </View>
      </View>
    );
  }

  const orderId = order._id || order.id;
  const status = (order.orderStatus || order.status || 'PENDING').toUpperCase();

  const STEPS = ['PLACED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentStepIdx = STEPS.indexOf(status) > -1 ? STEPS.indexOf(status) : 0;

  return (
    <View style={styles.container}>
      <Header
        title={`Order #${orderId.slice(-8).toUpperCase()}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Timeline Progress Bar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Tracking</Text>
          <View style={styles.timelineContainer}>
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <View key={step} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.completedCircle,
                      isCurrent && styles.activeCircle,
                    ]}
                  >
                    <Text style={[styles.stepNum, isCompleted && { color: '#ffffff' }]}>
                      {isCompleted ? '✓' : idx + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.completedLabel,
                    ]}
                  >
                    {step.replace(/_/g, ' ')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Information</Text>
          <Text style={styles.addressName}>
            {order.deliveryAddress?.fullName || 'Customer'}
          </Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress?.street || '12th Cross, Indiranagar'}
          </Text>
          <Text style={styles.addressText}>
            {order.deliveryAddress?.city || 'Bengaluru'}, {order.deliveryAddress?.pincode || '560103'}
          </Text>
          <Text style={[styles.addressText, { marginTop: 4, fontWeight: '600' }]}>
            Slot: {order.deliverySlot || 'Instant (25-35 mins)'}
          </Text>
        </View>

        {/* Items Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ordered Groceries ({order.items?.length || 0})</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name || item.product?.name}</Text>
                <Text style={styles.itemMeta}>
                  Qty: {item.quantity} • Shelf Life: {item.shelfLifeDays || 7} days
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.price || 0) * item.quantity}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.pantryTrackerBanner}
            onPress={() => navigation.navigate('SmartExpiry')}
          >
            <Text style={styles.trackerBannerText}>
              ⏱️ All items from this order are tracked in Smart Expiry →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment & Bill</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Payment Method</Text>
            <Text style={styles.billValue}>{order.paymentMethod || 'Razorpay'}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Payment Status</Text>
            <Text style={[styles.billValue, { color: colors.primaryDark }]}>
              {order.paymentStatus || 'PAID'}
            </Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>
        </View>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  completedCircle: {
    backgroundColor: colors.primary,
  },
  activeCircle: {
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stepLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  completedLabel: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  addressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  pantryTrackerBanner: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  trackerBannerText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '700',
    textAlign: 'center',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  billLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  billDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 15,
    color: colors.textMuted,
  },
});

export default OrderDetailsScreen;
