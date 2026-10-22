import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { addressAPI } from '../services/api';

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560103');
  const [type, setType] = useState('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await addressAPI.getAddresses();
      const list = res.data?.data?.addresses || res.data?.addresses || [];
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.updateAddress(id, { isDefault: true });
      loadAddresses();
    } catch (err) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this delivery address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressAPI.deleteAddress(id);
            loadAddresses();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleSaveAddress = async () => {
    if (!fullName || !phone || !houseFlat || !area) {
      Alert.alert('Required Fields', 'Please fill in Name, Phone, Flat/House No., and Area.');
      return;
    }

    try {
      setSaving(true);
      await addressAPI.createAddress({
        fullName,
        phone,
        houseFlat,
        street,
        area,
        city,
        state: 'Karnataka',
        pincode,
        type,
        isDefault,
      });

      setShowAddModal(false);
      resetForm();
      loadAddresses();
      Alert.alert('Success 🎉', 'New delivery address has been saved.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setHouseFlat('');
    setStreet('');
    setArea('');
    setCity('Bengaluru');
    setPincode('560103');
    setType('Home');
    setIsDefault(false);
  };

  const renderItem = ({ item }) => {
    const isHome = item.type === 'Home';

    return (
      <View style={[styles.card, item.isDefault && styles.defaultCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.tagRow}>
            <Text style={styles.typeIcon}>{isHome ? '🏠' : '💼'}</Text>
            <Text style={styles.userName}>{item.fullName}</Text>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>DEFAULT</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {!item.isDefault && (
              <TouchableOpacity
                onPress={() => handleSetDefault(item._id || item.id)}
                style={styles.setDefaultBtn}
              >
                <Text style={styles.setDefaultText}>Set Default</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleDelete(item._id || item.id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.addressLine}>
          {item.houseFlat}, {item.street ? `${item.street}, ` : ''}{item.area}
        </Text>
        <Text style={styles.cityLine}>
          {item.city}, {item.state || 'Karnataka'} - {item.pincode}
        </Text>
        <Text style={styles.phoneLine}>📞 {item.phone}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Saved Addresses"
        showBack
        onBack={() => navigation.goBack()}
        navigation={navigation}
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addHeaderText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading saved addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📍</Text>
          <Text style={styles.emptyTitle}>No Addresses Found</Text>
          <Text style={styles.emptySub}>Add your home or office address for fast delivery checkout.</Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addFirstText}>+ Add Delivery Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => (item._id || item.id || String(Math.random()))}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add Address Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. John Doe"
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Flat / House / Building</Text>
              <TextInput
                style={styles.input}
                value={houseFlat}
                onChangeText={setHouseFlat}
                placeholder="e.g. Flat 402, Green Valley"
              />

              <Text style={styles.label}>Street / Landmark</Text>
              <TextInput
                style={styles.input}
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. 12th Cross Road"
              />

              <Text style={styles.label}>Area / Colony</Text>
              <TextInput
                style={styles.input}
                value={area}
                onChangeText={setArea}
                placeholder="e.g. Indiranagar"
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>PIN Code</Text>
                  <TextInput
                    style={styles.input}
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.label}>Address Type</Text>
              <View style={styles.typeRow}>
                {['Home', 'Work', 'Other'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, type === t && styles.activeTypeBtn]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeBtnText, type === t && styles.activeTypeBtnText]}>
                      {t === 'Home' ? '🏠 Home' : t === 'Work' ? '💼 Work' : '📍 Other'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => setIsDefault(!isDefault)}
              >
                <Text style={styles.checkBox}>{isDefault ? '☑' : '☐'}</Text>
                <Text style={styles.checkLabel}>Set as default delivery address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveAddress}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : 'Save Delivery Address'}
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
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  defaultCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  defaultText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setDefaultBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  setDefaultText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  addressLine: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  cityLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneLine: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  addHeaderBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addHeaderText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
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
    marginBottom: 20,
    lineHeight: 18,
  },
  addFirstBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    padding: 4,
  },
  modalForm: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  activeTypeBtn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  activeTypeBtnText: {
    color: colors.primaryDark,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  checkBox: {
    fontSize: 18,
    color: colors.primary,
    marginRight: 8,
  },
  checkLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default AddressesScreen;
