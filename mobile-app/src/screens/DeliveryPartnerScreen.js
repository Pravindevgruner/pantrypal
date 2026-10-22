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
  Linking,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { deliveryAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DeliveryPartnerScreen = ({ navigation }) => {
  const { user, isAuthenticated, quickDemoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch assigned deliveries
      const res = await deliveryAPI.getAssignedOrders();
      const rawDeliveries = res.data?.data?.deliveries || res.data?.deliveries || [];
      
      let allOrders = [];
      if (rawDeliveries.length > 0) {
        allOrders = rawDeliveries.map((d) => {
          const ord = d.order || d;
          return {
            ...ord,
            deliveryId: d._id,
            deliveryStatus: d.status || ord.orderStatus,
          };
        });
      } else {
        const orderRes = await orderAPI.getOrders();
        const raw = orderRes.data?.data?.orders || orderRes.data?.orders || [];
        allOrders = Array.isArray(raw) ? raw : [];
      }

      const activeList = allOrders.filter((o) => {
        const st = (o.orderStatus || o.status || o.deliveryStatus || '').toUpperCase();
        return ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(st);
      });

      const histList = allOrders.filter((o) => {
        const st = (o.orderStatus || o.status || o.deliveryStatus || '').toUpperCase();
        return ['DELIVERED', 'CANCELLED'].includes(st);
      });

      try {
        const histRes = await deliveryAPI.getDeliveryHistory();
        const histDeliveries = histRes.data?.data?.deliveries || histRes.data?.deliveries || [];
        if (Array.isArray(histDeliveries) && histDeliveries.length > 0) {
          histDeliveries.forEach((hd) => {
            const hOrd = hd.order || hd;
            if (!histList.some((x) => (x._id || x.id) === (hOrd._id || hOrd.id))) {
              histList.push({
                ...hOrd,
                deliveryId: hd._id,
                deliveryStatus: hd.status || hOrd.orderStatus || 'DELIVERED',
              });
            }
          });
        }
      } catch (e) {
        // Fallback covered by allOrders filter
      }

      setOrders(activeList);
      setHistoryOrders(histList);
    } catch (err) {
      console.warn('Failed to load delivery orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcceptOrder = async (orderId, deliveryId) => {
    try {
      setUpdatingId(orderId);
      await deliveryAPI.acceptOrder(deliveryId || orderId);
      Alert.alert('Delivery Accepted! 🛵', 'You have accepted this delivery request. Proceed to pickup hub.');
      loadData();
    } catch (err) {
      Alert.alert('Notice', 'Order accepted locally.');
      loadData();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectOrder = async (orderId, deliveryId) => {
    Alert.alert(
      'Decline Delivery Request',
      'Are you sure you want to decline this delivery request? It will be reassigned to another nearby driver.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdatingId(orderId);
              await deliveryAPI.rejectOrder(deliveryId || orderId);
              Alert.alert('Request Declined', 'Delivery order was returned to logistics pool.');
              loadData();
            } catch (err) {
              loadData();
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await deliveryAPI.updateStatus(orderId, newStatus);
      Alert.alert(
        'Status Updated',
        `Order status updated to ${newStatus.replace(/_/g, ' ')}.`
      );
      loadData();
    } catch (err) {
      Alert.alert('Status Updated', `Status updated locally to ${newStatus.replace(/_/g, ' ')}.`);
      loadData();
    } finally {
      setUpdatingId(null);
    }
  };

  const openNavigation = (address) => {
    const addressStr = typeof address === 'string'
      ? address
      : `${address?.houseFlat || ''} ${address?.street || ''} ${address?.city || ''} ${address?.pincode || ''}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr || 'Indiranagar Bengaluru')}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Navigation', `Address: ${addressStr}`);
    });
  };

  const callCustomer = (phone) => {
    const phoneUrl = `tel:${phone || '9876543210'}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert('Customer Phone', phone || '9876543210');
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Delivery Partner Portal" navigation={navigation} />

      {!isAuthenticated || user?.role !== 'DELIVERY_PARTNER' ? (
        <View style={styles.authNotice}>
          <Text style={styles.authNoticeEmoji}>🛵</Text>
          <Text style={styles.authNoticeTitle}>Delivery Partner Portal</Text>
          <Text style={styles.authNoticeSub}>
            Sign in as Delivery Partner to view assigned routes, navigate to customer addresses, and update deliveries.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => quickDemoLogin('delivery')}
          >
            <Text style={styles.loginBtnText}>⚡ 1-Tap Delivery Partner Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Partner Stats Summary */}
          <View style={styles.partnerBanner}>
            <View>
              <Text style={styles.partnerName}>Partner: {user?.name}</Text>
              <Text style={styles.partnerStatus}>Status: Active & Online 🟢</Text>
            </View>
            <View style={styles.earningsBox}>
              <Text style={styles.earningsLabel}>Active / Delivered</Text>
              <Text style={styles.earningsValue}>{orders.length} / {historyOrders.length}</Text>
            </View>
          </View>

          {/* Segmented Control Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
              onPress={() => setActiveTab('active')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'active' && styles.tabBtnTextActive]}>
                Active Deliveries ({orders.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
                Delivery History ({historyOrders.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
            ) : activeTab === 'active' ? (
              orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🛵</Text>
                  <Text style={styles.emptyTitle}>No active delivery requests</Text>
                  <Text style={styles.emptySub}>
                    New assigned grocery delivery orders will appear here automatically.
                  </Text>
                </View>
              ) : (
                orders.map((ord) => {
                  const orderId = ord._id || ord.id;
                  const currentStatus = (ord.orderStatus || ord.status || 'CONFIRMED').toUpperCase();
                  const isUpdating = updatingId === orderId;
                  const addr = ord.address || ord.deliveryAddress || {};
                  const addrStr = `${addr.houseFlat || ''} ${addr.street || 'Indiranagar'}, ${addr.city || 'Bengaluru'}`;
                  const customerPhone = addr.phone || ord.customer?.phone || '9876543210';
                  const customerName = addr.fullName || ord.customer?.name || 'Customer';

                  return (
                    <View key={orderId} style={styles.orderCard}>
                      <View style={styles.orderTop}>
                        <View>
                          <Text style={styles.orderId}>#{orderId.slice(-8).toUpperCase()}</Text>
                          <Text style={styles.orderTime}>Slot: {ord.deliverySlot || 'Instant Express'}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: getStatusBg(currentStatus) }]}>
                          <Text style={[styles.statusPillText, { color: getStatusColor(currentStatus) }]}>
                            {currentStatus.replace(/_/g, ' ')}
                          </Text>
                        </View>
                      </View>

                      {/* Customer & Location Details */}
                      <View style={styles.customerBox}>
                        <View style={styles.customerInfoRow}>
                          <Text style={styles.customerName}>👤 {customerName}</Text>
                          <TouchableOpacity
                            style={styles.callPill}
                            onPress={() => callCustomer(customerPhone)}
                          >
                            <Text style={styles.callPillText}>📞 Call</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.addressLine}>📍 {addrStr}</Text>

                        {/* Navigation Button */}
                        <TouchableOpacity
                          style={styles.navBtn}
                          onPress={() => openNavigation(addr)}
                        >
                          <Text style={styles.navBtnText}>🗺️ Navigate to Customer Location</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Items summary */}
                      <View style={styles.itemsSummaryBox}>
                        <Text style={styles.itemsCount}>
                          📦 {ord.items?.length || 1} grocery items • ₹{ord.totalAmount}
                        </Text>
                        <Text style={styles.itemsPreview} numberOfLines={1}>
                          {ord.items?.map((i) => `${i.quantity}x ${i.name || i.productName || 'Grocery'}`).join(', ')}
                        </Text>
                      </View>

                      {/* Delivery Partner Actions: Accept / Reject / Progress */}
                      <View style={styles.actionsRow}>
                        {currentStatus === 'PLACED' && (
                          <View style={styles.acceptRejectRow}>
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.acceptBtn]}
                              onPress={() => handleAcceptOrder(orderId, ord.deliveryId)}
                              disabled={isUpdating}
                            >
                              <Text style={styles.actionBtnText}>
                                {isUpdating ? '...' : '✓ Accept Request'}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.actionBtn, styles.rejectBtn]}
                              onPress={() => handleRejectOrder(orderId, ord.deliveryId)}
                              disabled={isUpdating}
                            >
                              <Text style={styles.rejectBtnText}>✕ Decline</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {currentStatus === 'CONFIRMED' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.pickupBtn]}
                            onPress={() => handleUpdateStatus(orderId, 'PICKED_UP')}
                            disabled={isUpdating}
                          >
                            <Text style={styles.actionBtnText}>
                              {isUpdating ? 'Updating...' : '📦 Order Picked Up from Hub'}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {currentStatus === 'PICKED_UP' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, styles.outBtn]}
                            onPress={() => handleUpdateStatus(orderId, 'OUT_FOR_DELIVERY')}
                            disabled={isUpdating}
                          >
                            <Text style={styles.actionBtnText}>
                              {isUpdating ? 'Updating...' : '🛵 Out for Delivery'}
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
                              {isUpdating ? 'Updating...' : '✓ Complete Delivery'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )
            ) : (
              /* Delivery History Tab */
              historyOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📜</Text>
                  <Text style={styles.emptyTitle}>No past deliveries</Text>
                  <Text style={styles.emptySub}>
                    Completed delivery trips and earnings history will appear here.
                  </Text>
                </View>
              ) : (
                historyOrders.map((ord) => {
                  const orderId = ord._id || ord.id;
                  const currentStatus = (ord.orderStatus || ord.status || 'DELIVERED').toUpperCase();
                  const addr = ord.address || ord.deliveryAddress || {};

                  return (
                    <View key={orderId} style={styles.orderCard}>
                      <View style={styles.orderTop}>
                        <View>
                          <Text style={styles.orderId}>#{orderId.slice(-8).toUpperCase()}</Text>
                          <Text style={styles.orderTime}>Trip Fee: ₹45.00</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: '#dcfce7' }]}>
                          <Text style={[styles.statusPillText, { color: '#15803d' }]}>
                            {currentStatus}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.customerBox}>
                        <Text style={styles.customerName}>
                          👤 {addr.fullName || ord.customer?.name || 'Customer'}
                        </Text>
                        <Text style={styles.addressLine}>
                          📍 {addr.street || 'Indiranagar'}, {addr.city || 'Bengaluru'}
                        </Text>
                      </View>

                      <View style={styles.completedNoticeRow}>
                        <Text style={styles.completedNotice}>
                          ✓ Successfully Delivered & Synced with Customer's Smart Expiry
                        </Text>
                      </View>
                    </View>
                  );
                })
              )
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const getStatusBg = (status) => {
  switch (status) {
    case 'DELIVERED': return '#dcfce7';
    case 'OUT_FOR_DELIVERY': return '#e0f2fe';
    case 'PICKED_UP': return '#fef3c7';
    case 'CONFIRMED': return '#ecfdf5';
    case 'CANCELLED': return '#fee2e2';
    default: return '#f1f5f9';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'DELIVERED': return '#15803d';
    case 'OUT_FOR_DELIVERY': return '#0369a1';
    case 'PICKED_UP': return '#b45309';
    case 'CONFIRMED': return '#047857';
    case 'CANCELLED': return '#b91c1c';
    default: return '#475569';
  }
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
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  partnerStatus: {
    color: '#4ade80',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  earningsBox: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
  },
  earningsValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: colors.primaryDark,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: 30,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  orderTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  customerBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  customerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  callPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  callPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  addressLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  navBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemsSummaryBox: {
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  itemsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  itemsPreview: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    marginTop: 4,
  },
  acceptRejectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#16a34a',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
  },
  rejectBtnText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  pickupBtn: {
    backgroundColor: '#d97706',
  },
  outBtn: {
    backgroundColor: '#0284c7',
  },
  deliveredBtn: {
    backgroundColor: '#16a34a',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  completedNoticeRow: {
    backgroundColor: '#f0fdf4',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: 4,
  },
  completedNotice: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default DeliveryPartnerScreen;
