import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
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

const QUICK_PRESETS = [
  { name: 'Organic Whole Milk', cat: 'Dairy', days: 5, unit: '1 L', loc: 'Fridge' },
  { name: 'Farm Fresh Eggs (12pk)', cat: 'Dairy', days: 21, unit: '12 pcs', loc: 'Fridge' },
  { name: 'Sourdough Bread', cat: 'Bakery', days: 4, unit: '1 loaf', loc: 'Pantry' },
  { name: 'Bananas', cat: 'Produce', days: 5, unit: '6 pcs', loc: 'Pantry' },
  { name: 'Greek Yogurt', cat: 'Dairy', days: 10, unit: '400 g', loc: 'Fridge' },
  { name: 'Basmati Rice', cat: 'Staples', days: 365, unit: '5 kg', loc: 'Pantry' },
];

const HouseholdPantryScreen = ({ navigation }) => {
  const { isAuthenticated, quickDemoLogin } = useAuth();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Item Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Dairy');
  const [shelfLifeDays, setShelfLifeDays] = useState('7');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('unit');
  const [storageLocation, setStorageLocation] = useState('Fridge');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadPantryItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadPantryItems = async () => {
    try {
      setLoading(true);
      const res = await expiryAPI.getExpiryItems();
      const rawList = res.data?.data?.items || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setItems(Array.isArray(rawList) ? rawList : []);
    } catch (err) {
      console.warn('Failed to load household pantry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPantryItems();
  };

  const applyPreset = (preset) => {
    setItemName(preset.name);
    setCategory(preset.cat);
    setShelfLifeDays(String(preset.days));
    setUnit(preset.unit);
    setStorageLocation(preset.loc);
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Required', 'Please enter the item name');
      return;
    }

    try {
      setSaving(true);
      await expiryAPI.addExpiryItem({
        itemName: itemName.trim(),
        category,
        shelfLifeDays: parseInt(shelfLifeDays, 10) || 7,
        quantity: parseFloat(quantity) || 1,
        unit,
        location: storageLocation,
        purchasedDate: new Date().toISOString(),
      });

      setModalVisible(false);
      setItemName('');
      setShelfLifeDays('7');
      setQuantity('1');
      Alert.alert('Success 🎉', `${itemName} logged in your household pantry.`);
      loadPantryItems();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Remove from Pantry',
      `Delete "${item.itemName}" from your records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expiryAPI.deleteExpiryItem(item._id || item.id);
              loadPantryItems();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleMarkConsumed = async (item) => {
    try {
      await expiryAPI.markConsumed(item._id || item.id, item.quantity || 1);
      Alert.alert('Great! 🥗', `Marked ${item.itemName} as consumed.`);
      loadPantryItems();
    } catch (err) {
      Alert.alert('Error', 'Failed to mark as consumed');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = (item.itemName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLocation =
      locationFilter === 'ALL' ||
      (item.location || '').toLowerCase() === locationFilter.toLowerCase();
    return matchesSearch && matchesLocation;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Household Pantry"
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+ Add Item</Text>
          </TouchableOpacity>
        }
      />

      {!isAuthenticated ? (
        <View style={styles.authNotice}>
          <Text style={styles.authNoticeEmoji}>🏠</Text>
          <Text style={styles.authNoticeTitle}>Manage Your Kitchen Groceries</Text>
          <Text style={styles.authNoticeSub}>
            Sign in to track real-time inventory in your Fridge, Pantry, and Freezer.
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
          {/* Search Box */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items in your pantry..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Location Filters */}
          <View style={styles.filterRow}>
            {['ALL', 'Fridge', 'Pantry', 'Freezer'].map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.locationChip,
                  locationFilter === loc && styles.activeLocationChip,
                ]}
                onPress={() => setLocationFilter(loc)}
              >
                <Text
                  style={[
                    styles.locationChipText,
                    locationFilter === loc && styles.activeLocationChipText,
                  ]}
                >
                  {loc === 'Fridge' ? '❄️ Fridge' :
                   loc === 'Pantry' ? '🥫 Pantry' :
                   loc === 'Freezer' ? '🧊 Freezer' : 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Items List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🥣</Text>
              <Text style={styles.emptyTitle}>Pantry is empty</Text>
              <Text style={styles.emptySub}>
                Add grocery items you have bought or receive them automatically when you place orders!
              </Text>
              <TouchableOpacity
                style={styles.addNewItemBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addNewItemBtnText}>+ Add First Grocery Item</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredItems.map((item) => {
              const daysLeft = item.daysRemaining !== undefined
                ? item.daysRemaining
                : dayjs(item.estimatedExpiryDate).diff(dayjs(), 'day');

              return (
                <View key={item._id || item.id} style={styles.pantryCard}>
                  <View style={styles.pantryHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pantryName}>{item.itemName}</Text>
                      <Text style={styles.pantrySub}>
                        {item.quantity} {item.unit || 'unit'} • Location: {item.location || 'Pantry'}
                      </Text>
                    </View>
                    <ExpiryBadge status={item.status} daysRemaining={daysLeft} />
                  </View>

                  <View style={styles.pantryMetaRow}>
                    <Text style={styles.metaText}>
                      Shelf Life: {item.shelfLifeDays || 7} days
                    </Text>
                    <Text style={styles.metaText}>
                      Expires: {dayjs(item.estimatedExpiryDate).format('DD MMM YYYY')}
                    </Text>
                  </View>

                  <View style={styles.itemActions}>
                    {item.status !== 'CONSUMED' && item.status !== 'DISCARDED' ? (
                      <TouchableOpacity
                        style={styles.consumeAction}
                        onPress={() => handleMarkConsumed(item)}
                      >
                        <Text style={styles.consumeActionText}>✓ Consumed</Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={styles.deleteAction}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Text style={styles.deleteActionText}>🗑 Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Add Item Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Household Grocery</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Quick Presets */}
              <Text style={styles.fieldLabel}>Quick Presets:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {QUICK_PRESETS.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.presetChip}
                    onPress={() => applyPreset(p)}
                  >
                    <Text style={styles.presetText}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Item Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Greek Yogurt, Tomatoes"
                value={itemName}
                onChangeText={setItemName}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fieldLabel}>Shelf Life (Days) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="7"
                    keyboardType="numeric"
                    value={shelfLifeDays}
                    onChangeText={setShelfLifeDays}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.fieldLabel}>Quantity & Unit</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1 kg / 500 ml"
                    value={`${quantity} ${unit}`}
                    onChangeText={(val) => {
                      const parts = val.split(' ');
                      setQuantity(parts[0] || '1');
                      setUnit(parts[1] || 'unit');
                    }}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Storage Location</Text>
              <View style={styles.locButtonsRow}>
                {['Fridge', 'Pantry', 'Freezer'].map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.locSelectBtn,
                      storageLocation === loc && styles.activeLocSelectBtn,
                    ]}
                    onPress={() => setStorageLocation(loc)}
                  >
                    <Text
                      style={[
                        styles.locSelectText,
                        storageLocation === loc && styles.activeLocSelectText,
                      ]}
                    >
                      {loc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleAddItem}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : 'Add to Household Pantry'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  activeLocationChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  locationChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeLocationChipText: {
    color: '#ffffff',
  },
  pantryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pantryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pantryName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  pantrySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pantryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  consumeAction: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  consumeActionText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteAction: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deleteActionText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '700',
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
  addNewItemBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addNewItemBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  presetChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  presetText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 42,
    fontSize: 13,
    color: colors.text,
  },
  formRow: {
    flexDirection: 'row',
  },
  locButtonsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  locSelectBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  activeLocSelectBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  locSelectText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeLocSelectText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default HouseholdPantryScreen;
