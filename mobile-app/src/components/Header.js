import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';
import { useCart } from '../context/CartContext';

const Header = ({ title, subtitle, showBack, onBack, rightAction, navigation }) => {
  const { itemCount } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack || (() => navigation?.goBack())} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.right}>
        {rightAction ? (
          rightAction
        ) : navigation ? (
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  backText: {
    fontSize: 24,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBtn: {
    position: 'relative',
    padding: spacing.xs,
  },
  cartIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;
