import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { notificationAPI } from '../services/api';

dayjs.extend(relativeTime);

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications();
      const list = res.data?.data?.notifications || res.data?.notifications || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Mark all read error:', err);
    }
  };

  const handlePressItem = async (item) => {
    if (!item.isRead) {
      try {
        await notificationAPI.markAsRead(item._id || item.id);
        setNotifications((prev) =>
          prev.map((n) => ((n._id || n.id) === (item._id || item.id) ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        // ignore
      }
    }

    if (item.type === 'EXPIRY') {
      navigation.navigate('SmartExpiry');
    } else if (item.type === 'ORDER' || item.type === 'DELIVERY') {
      navigation.navigate('Orders');
    }
  };

  const getTypeMeta = (type) => {
    switch (type) {
      case 'EXPIRY':
        return { emoji: '⏱️', badge: 'Expiry Alert', color: '#f59e0b', bg: '#fef3c7' };
      case 'ORDER':
        return { emoji: '🛍️', badge: 'Order Update', color: '#059669', bg: '#d1fae5' };
      case 'DELIVERY':
        return { emoji: '🛵', badge: 'Live Delivery', color: '#8b5cf6', bg: '#ede9fe' };
      case 'PAYMENT':
        return { emoji: '💳', badge: 'Payment Confirmed', color: '#3b82f6', bg: '#dbeafe' };
      case 'PROMO':
        return { emoji: '🏷️', badge: 'Exclusive Offer', color: '#ec4899', bg: '#fce7f3' };
      default:
        return { emoji: '🔔', badge: 'Notice', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const renderItem = ({ item }) => {
    const meta = getTypeMeta(item.type);
    const timeFormatted = item.createdAt ? dayjs(item.createdAt).fromNow() : 'Just now';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => handlePressItem(item)}
      >
        <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
          <Text style={styles.iconEmoji}>{meta.emoji}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.badgeText, { color: meta.color }]}>{meta.badge}</Text>
            </View>
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>

          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        navigation={navigation}
        rightAction={
          notifications.some((n) => !n.isRead) ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching your notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>No Notifications Yet</Text>
          <Text style={styles.emptySub}>
            Order updates, live delivery tracking, payment receipts, and smart expiry alerts will appear here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => (item._id || item.id || String(Math.random()))}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadNotifications();
              }}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#064e3b',
  },
  message: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default NotificationsScreen;
