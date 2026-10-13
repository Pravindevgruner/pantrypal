import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import dayjs from 'dayjs';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersScreen = ({ navigation }) => {
  const { isAuthenticated, quickDemoLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getOrders();
      setOrders(res.data?.orders || res.data || []);
    } catch (err) {
      console.warn('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    let bg = colors.primaryLight;
    let color = colors.primaryDark;

    if (s === 'PENDING') {
      bg = '#fef3c7';
      color = '#d97706';
    } else if (s === 'OUT_FOR_DELIVERY') {
      bg = '#e0f2fe';
      color = '#0284c7';
    } else if (s === 'CANCELLED') {
      bg = colors.dangerLight;
      color = colors.danger;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>{s.replace(/_/g, ' ')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="My Orders" navigation={navigation} />

      {!isAuthenticated ? (
        <View style={styles.authNotice}>
          <Text style={styles.authNoticeEmoji}>📦</Text>
          <Text style={styles.authNoticeTitle}>Track Your Grocery Deliveries</Text>
          <Text style={styles.authNoticeSub}>
            Sign in to view your orders, live tracking, and invoices.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => quickDemoLogin('customer')}
          >
            <Text style={styles.loginBtnText}>⚡ 1-Tap Customer Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={styles.emptyTitle}>No orders placed yet</Text>
              <Text style={styles.emptySub}>
                Order fresh milk, greens, and essentials right to your doorstep.
              </Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.shopBtnText}>Shop Groceries Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((ord) => {
              const orderId = ord._id || ord.id;
              const dateStr = dayjs(ord.createdAt).format('DD MMM YYYY, hh:mm A');
              const itemCount = ord.items?.length || 0;

              return (
                <TouchableOpacity
                  key={orderId}
                  style={styles.orderCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('OrderDetails', { order: ord })}
                >
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderNumber}>
                        Order #{orderId.slice(-8).toUpperCase()}
                      </Text>
                      <Text style={styles.orderDate}>{dateStr}</Text>
                    </View>
                    {getStatusBadge(ord.orderStatus || ord.status)}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.itemsRow}>
                    <Text style={styles.itemsSummary} numberOfLines={2}>
                      {ord.items?.map((i) => `${i.quantity}x ${i.name || i.product?.name}`).join(', ')}
                    </Text>
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.totalAmount}>₹{ord.totalAmount}</Text>
                    <Text style={styles.detailsLink}>View Details →</Text>
                  </View>
                </TouchableOpacity>
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
    backgroundColor: colors.primary,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 50,
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
    marginTop: 4,
    paddingHorizontal: 20,
  },
  shopBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: spacing.sm,
  },
  itemsRow: {
    marginBottom: spacing.sm,
  },
  itemsSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  detailsLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default OrdersScreen;
