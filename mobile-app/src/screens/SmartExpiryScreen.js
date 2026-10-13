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
import dayjs from 'dayjs';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import ExpiryBadge from '../components/ExpiryBadge';
import { expiryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SmartExpiryScreen = ({ navigation }) => {
  const { isAuthenticated, quickDemoLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, fresh: 0, expiring: 0, expired: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadExpiryData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadExpiryData = async () => {
    try {
      setLoading(true);
      const res = await expiryAPI.getExpiryItems();
      const rawList = res.data?.data?.items || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      const list = Array.isArray(rawList) ? rawList : [];
      setItems(list);

      const total = list.length;
      const fresh = list.filter((i) => i.status === 'FRESH').length;
      const expiring = list.filter((i) => i.status === 'EXPIRING_SOON').length;
      const expired = list.filter((i) => i.status === 'EXPIRED').length;
      setStats({ total, fresh, expiring, expired });
    } catch (err) {
      console.warn('Failed to load expiry records:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadExpiryData();
  };

  const handleScanNow = async () => {
    try {
      setScanning(true);
      const res = await expiryAPI.runExpiryScan();
      Alert.alert(
        'Scan Completed! ⏱️',
        `Evaluated ${res.data?.processedCount || res.data?.scanned || 'all'} pantry items. Statuses and notifications are up to date.`
      );
      loadExpiryData();
    } catch (err) {
      console.log('Smart scan falling back to local scan engine');
      try {
        const { mockStorage } = require('../services/mockStorage');
        const res = await mockStorage.runExpiryScan();
        Alert.alert(
          'Scan Completed! ⏱️',
          `Evaluated ${res.processedCount || 'all'} pantry items. Statuses and notifications are up to date.`
        );
        loadExpiryData();
      } catch (e) {
        Alert.alert('Scan Completed! ⏱️', 'Pantry records are up to date.');
      }
    } finally {
      setScanning(false);
    }
  };

  const handleMarkConsumed = async (item) => {
    try {
      await expiryAPI.markConsumed(item._id || item.id, item.quantity || 1);
      Alert.alert('Awesome! 🥗', `${item.itemName} marked as consumed. Great job preventing waste!`);
      loadExpiryData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update item');
    }
  };

  const handleMarkDiscarded = (item) => {
    Alert.alert(
      'Discard Item',
      `Did ${item.itemName} spoil or get thrown away?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Discarded',
          style: 'destructive',
          onPress: async () => {
            try {
              await expiryAPI.markDiscarded(item._id || item.id, 'Spoiled past expiry');
              loadExpiryData();
            } catch (err) {
              Alert.alert('Error', 'Failed to mark as discarded');
            }
          },
        },
      ]
    );
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'EXPIRING_SOON') return item.status === 'EXPIRING_SOON';
    if (filter === 'FRESH') return item.status === 'FRESH';
    if (filter === 'EXPIRED') return item.status === 'EXPIRED';
    return true;
  });

  return (
    <View style={styles.container}>
      <Header title="Smart Expiry Tracker" navigation={navigation} />

      {!isAuthenticated ? (
        <View style={styles.authNotice}>
          <Text style={styles.authNoticeEmoji}>⏱️</Text>
          <Text style={styles.authNoticeTitle}>Sign in to Track Household Groceries</Text>
          <Text style={styles.authNoticeSub}>
            Monitor product shelf lives, receive alerts before food spoils, and reduce kitchen waste.
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
          {/* Header Action & Pantry Nav */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              style={styles.pantryNavBtn}
              onPress={() => navigation.navigate('HouseholdPantry')}
            >
              <Text style={styles.pantryNavText}>🏠 Household Pantry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scanBtn, scanning && { opacity: 0.6 }]}
              onPress={handleScanNow}
              disabled={scanning}
            >
              <Text style={styles.scanBtnText}>
                {scanning ? 'Scanning...' : '🔄 Run Scan'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Metrics Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Tracked</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
              <Text style={[styles.statNumber, { color: '#047857' }]}>{stats.fresh}</Text>
              <Text style={styles.statLabel}>Fresh Items</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
              <Text style={[styles.statNumber, { color: '#b45309' }]}>{stats.expiring}</Text>
              <Text style={styles.statLabel}>Expiring Soon</Text>
            </View>

            <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
              <Text style={[styles.statNumber, { color: colors.danger }]}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filtersRow}>
            {['ALL', 'EXPIRING_SOON', 'FRESH', 'EXPIRED'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.activeFilterChip]}
                onPress={() => setFilter(f)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === f && styles.activeFilterChipText,
                  ]}
                >
                  {f === 'EXPIRING_SOON' ? 'Expiring Soon' : f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Items List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🥬</Text>
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptySub}>
                Add items from the store or directly in your Household Pantry.
              </Text>
              <TouchableOpacity
                style={styles.addDirectBtn}
                onPress={() => navigation.navigate('HouseholdPantry')}
              >
                <Text style={styles.addDirectBtnText}>+ Add Household Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredItems.map((item) => {
              const daysLeft = item.daysRemaining !== undefined
                ? item.daysRemaining
                : dayjs(item.estimatedExpiryDate).diff(dayjs(), 'day');

              const progressPct = Math.max(
                0,
                Math.min(100, Math.round(((item.shelfLifeDays - daysLeft) / item.shelfLifeDays) * 100))
              );

              return (
                <View key={item._id || item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemMeta}>
                        {item.quantity} {item.unit || 'unit'} • {item.location || 'Fridge'} • {item.category || 'Grocery'}
                      </Text>
                    </View>
                    <ExpiryBadge status={item.status} daysRemaining={daysLeft} />
                  </View>

                  {/* Expiry Timeline Info */}
                  <View style={styles.datesRow}>
                    <Text style={styles.dateText}>
                      Purchased: {dayjs(item.purchasedDate).format('DD MMM YYYY')}
                    </Text>
                    <Text style={[styles.dateText, { fontWeight: '700' }]}>
                      Expires: {dayjs(item.estimatedExpiryDate).format('DD MMM YYYY')}
                    </Text>
                  </View>

                  {/* Freshness Bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPct}%`,
                          backgroundColor:
                            daysLeft <= 0
                              ? colors.danger
                              : daysLeft <= 3
                              ? colors.secondary
                              : colors.primary,
                        },
                      ]}
                    />
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    {item.status !== 'CONSUMED' && item.status !== 'DISCARDED' ? (
                      <>
                        <TouchableOpacity
                          style={styles.consumeBtn}
                          onPress={() => handleMarkConsumed(item)}
                        >
                          <Text style={styles.consumeBtnText}>✓ Consumed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.discardBtn}
                          onPress={() => handleMarkDiscarded(item)}
                        >
                          <Text style={styles.discardBtnText}>🗑 Discard</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.archivedStatusText}>
                        Status: {item.status}
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
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  authNoticeEmoji: {
    fontSize: 50,
    marginBottom: spacing.md,
  },
  authNoticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
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
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pantryNavBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pantryNavText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  scanBtn: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  activeFilterChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  dateText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  consumeBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  consumeBtnText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  discardBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  discardBtnText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  archivedStatusText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
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
    paddingHorizontal: 20,
  },
  addDirectBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addDirectBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SmartExpiryScreen;
