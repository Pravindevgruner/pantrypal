import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout, quickDemoLogin, updateUserData } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleOpenEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter your name.');
      return;
    }

    try {
      setSaving(true);
      await authAPI.updateProfile({ name, phone });
      if (updateUserData) {
        updateUserData({ ...user, name, phone });
      }
      setShowEditModal(false);
      Alert.alert('Success 🎉', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Account" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {isAuthenticated ? user?.name : 'Guest User'}
            </Text>
            <Text style={styles.userEmail}>
              {isAuthenticated ? user?.email : 'Sign in to access your pantry'}
            </Text>
            {user?.phone ? (
              <Text style={styles.userPhone}>📞 {user.phone}</Text>
            ) : null}
            {isAuthenticated && (
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{user?.role || 'CUSTOMER'}</Text>
              </View>
            )}
          </View>

          {isAuthenticated && (
            <TouchableOpacity style={styles.editBtn} onPress={handleOpenEdit}>
              <Text style={styles.editBtnText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 1-Tap Quick Demo Role Switcher */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>⚡ 1-Tap Demo Role Switcher</Text>
          <Text style={styles.demoSub}>Switch account roles instantly for seamless testing</Text>

          <View style={styles.rolesGrid}>
            <TouchableOpacity
              style={[styles.roleBtn, user?.role === 'CUSTOMER' && styles.activeRoleBtn]}
              onPress={() => quickDemoLogin('customer')}
            >
              <Text style={styles.roleBtnText}>🛒 Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, user?.role === 'DELIVERY_PARTNER' && styles.activeRoleBtn]}
              onPress={() => {
                quickDemoLogin('delivery');
                navigation.navigate('DeliveryPartner');
              }}
            >
              <Text style={styles.roleBtnText}>🛵 Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleBtn, user?.role === 'ADMIN' && styles.activeRoleBtn]}
              onPress={() => quickDemoLogin('admin')}
            >
              <Text style={styles.roleBtnText}>🛠️ Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Sections */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SmartExpiry')}
          >
            <Text style={styles.menuIcon}>⏱️</Text>
            <Text style={styles.menuText}>Smart Expiry Tracker</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>Core AI</Text>
            </View>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HouseholdPantry')}
          >
            <Text style={styles.menuIcon}>🏠</Text>
            <Text style={styles.menuText}>Household Grocery Pantry</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.menuIcon}>🛍️</Text>
            <Text style={styles.menuText}>My Orders & Invoices</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Text style={styles.menuIcon}>❤️</Text>
            <Text style={styles.menuText}>My Wishlist</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Addresses')}
          >
            <Text style={styles.menuIcon}>📍</Text>
            <Text style={styles.menuText}>Saved Delivery Addresses</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notifications & Alerts</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DeliveryPartner')}
          >
            <Text style={styles.menuIcon}>🛵</Text>
            <Text style={styles.menuText}>Delivery Partner Portal</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Action */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.appVersion}>PantryPal Mobile v1.0.0 • Smart Grocery Delivery</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9876543210"
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving...' : 'Update Profile'}
                </Text>
              </TouchableOpacity>
            </View>
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
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  rolePillText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  editBtnText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  demoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
  },
  demoSub: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  rolesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  activeRoleBtn: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badgePill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgePillText: {
    color: '#b45309',
    fontSize: 9,
    fontWeight: '800',
  },
  menuArrow: {
    fontSize: 14,
    color: colors.textMuted,
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginBottom: spacing.lg,
  },
  logoutBtnText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '800',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 20,
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
  inputLabel: {
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
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default ProfileScreen;
