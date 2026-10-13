import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DeliveryPartnerScreen = ({ navigation }) => {
  const { user, isAuthenticated, quickDemoLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadDeliveryOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const loadDeliveryOrders = async () => {
    try {
      setLoading(true);
      // Delivery partners get orders assigned to them or active orders
      const res = await orderAPI.getOrders();
      const rawOrders = res.data?.data?.orders || res.data?.orders || (Array.isArray(res.data) ? res.data : []);
      const allOrders = Array.isArray(rawOrders) ? rawOrders : [];
      // Filter orders relevant for delivery partner
      const deliveryOrders = allOrders.filter(
        (o) =>
          o.orderStatus === 'CONFIRMED' ||
          o.orderStatus === 'OUT_FOR_DELIVERY' ||
          o.orderStatus === 'DELIVERED'
      );
      setOrders(deliveryOrders.length > 0 ? deliveryOrders : allOrders);
    } catch (err) {
      console.warn('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDeliveryOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      Alert.alert(
        'Status Updated',
        `Order status changed to ${newStatus.replace(/_/g, ' ')}.`
      );
      loadDeliveryOrders();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Delivery Partner Portal" navigation={navigation} />

      {!isAuthenticated || user?.role !== 'DELIVERY_PARTNER' ? (
        <View style={styles.authNotice}>
          <Text style={styles.authNoticeEmoji}>🛵</Text>
          <Text style={styles.authNoticeTitle}>Delivery Partner Portal</Text>
          <Text style={styles.authNoticeSub}>
            Sign in as Delivery Partner to view assigned routes, customer addresses, and update deliveries.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => quickDemoLogin('delivery')}
          >
            <Text style={styles.loginBtnText}>⚡ 1-Tap Delivery Partner Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {/* Partner Stats Summary */}
          <View style={styles.partnerBanner}>
            <View>
              <Text style={styles.partnerName}>Partner: {user?.name}</Text>
              <Text style={styles.partnerStatus}>Status: Active & Online 🟢</Text>
            </View>
            <View style={styles.earningsBox}>
              <Text style={styles.earningsLabel}>Today's Deliveries</Text>
              <Text style={styles.earningsValue}>{orders.length}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Assigned Grocery Deliveries</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🛵</Text>
              <Text style={styles.emptyTitle}>No active delivery requests</Text>
              <Text style={styles.emptySub}>
                New assigned delivery orders will appear here automatically.
              </Text>
            </View>
          ) : (
            orders.map((ord) => {
              const orderId = ord._id || ord.id;
              const currentStatus = (ord.orderStatus || ord.status || 'CONFIRMED').toUpperCase();
              const isUpdating = updatingId === orderId;

              return (
                <View key={orderId} style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderId}>#{orderId.slice(-8).toUpperCase()}</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{currentStatus}</Text>
                    </View>
                  </View>

                  {/* Customer Information */}
                  <View style={styles.customerBox}>
                    <Text style={styles.customerName}>
                      👤 {ord.deliveryAddress?.fullName || 'Customer'}
                    </Text>
                    <Text style={styles.customerPhone}>
                      📞 {ord.deliveryAddress?.phone || '9876543210'}
                    </Text>
                    <Text style={styles.addressLine}>
                      📍 {ord.deliveryAddress?.street || '12th Cross, Indiranagar'}, {ord.deliveryAddress?.city}
                    </Text>
                  </View>

                  {/* Items summary */}
                  <Text style={styles.itemsCount}>
                    📦 {ord.items?.length || 1} grocery packages • Slot: {ord.deliverySlot || 'Instant'}
                  </Text>

                  {/* Delivery Actions */}
                  <View style={styles.actionsRow}>
                    {currentStatus === 'CONFIRMED' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.outBtn]}
                        onPress={() => handleUpdateStatus(orderId, 'OUT_FOR_DELIVERY')}
                        disabled={isUpdating}
                      >
                        <Text style={styles.actionBtnText}>
                          {isUpdating ? 'Updating...' : '🛵 Start Delivery'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'OUT_FOR_DELIVERY' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.deliveredBtn]}
                        onPress={() => handleUpdateStatus(orderId, 'DELIVERED')}
                        disabled={isUpdating}
                      >
                        <Text style={styles.actionBtnText}>
                          {isUpdating ? 'Updating...' : '✓ Mark as Delivered'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {currentStatus === 'DELIVERED' && (
                      <Text style={styles.completedNotice}>
                        ✓ Completed & Delivered to customer
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
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
    paddingBottom: 40,
  },
  authNotice: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  authNoticeEmoji: {
    fontSize: 50,
    marginBottom: spacing.md,
  },
  authNoticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  authNoticeSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: '#0284c7',
    marginTop: spacing.xl,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  partnerBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  partnerName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  partnerStatus: {
    color: '#34d399',
    fontSize: 12,
    marginTop: 4,
  },
  earningsBox: {
    alignItems: 'center',
  },
  earningsLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  earningsValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  statusPill: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
  },
  customerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addressLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemsCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginVertical: spacing.xs,
  },
  actionsRow: {
    marginTop: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  outBtn: {
    backgroundColor: '#0284c7',
  },
  deliveredBtn: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  completedNotice: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 44,
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
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DeliveryPartnerScreen;
