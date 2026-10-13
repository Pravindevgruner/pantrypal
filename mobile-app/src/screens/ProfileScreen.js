import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
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
            {isAuthenticated && (
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{user?.role || 'CUSTOMER'}</Text>
              </View>
            )}
          </View>
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#93c5fd',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  activeRoleBtn: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
  menuArrow: {
    fontSize: 14,
    color: colors.textMuted,
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
