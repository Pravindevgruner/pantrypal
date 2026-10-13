import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const ExpiryBadge = ({ status, daysRemaining }) => {
  let bg = colors.primaryLight;
  let textCol = colors.primaryDark;
  let label = 'Fresh';

  const s = (status || '').toUpperCase();

  if (s === 'EXPIRED') {
    bg = colors.dangerLight;
    textCol = colors.danger;
    label = 'Expired';
  } else if (s === 'EXPIRING_SOON') {
    bg = colors.secondaryLight;
    textCol = colors.secondary;
    label = typeof daysRemaining === 'number' ? `${daysRemaining}d left` : 'Expiring Soon';
  } else if (s === 'CONSUMED') {
    bg = '#eff6ff';
    textCol = '#2563eb';
    label = 'Consumed';
  } else if (s === 'DISCARDED') {
    bg = '#f3f4f6';
    textCol = '#6b7280';
    label = 'Discarded';
  } else {
    label = typeof daysRemaining === 'number' ? `${daysRemaining}d fresh` : 'Fresh';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textCol }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default ExpiryBadge;
