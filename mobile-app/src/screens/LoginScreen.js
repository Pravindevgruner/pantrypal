import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, spacing } from '../styles/theme';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);
      if (res.success) {
        navigation.goBack();
      } else {
        Alert.alert('Login Failed', res.error);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    try {
      setLoading(true);
      const res = await quickDemoLogin(role);
      if (res.success) {
        if (role === 'delivery') {
          navigation.replace('DeliveryPartner');
        } else {
          navigation.goBack();
        }
      } else {
        Alert.alert('Demo Login Error', res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Sign In" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🥦</Text>
          <Text style={styles.brandTitle}>PantryPal</Text>
          <Text style={styles.brandSub}>Smart Grocery Delivery & Expiry Tracker</Text>
        </View>

        {/* 1-Tap Demo Buttons */}
        <View style={styles.demoCard}>
          <Text style={styles.demoHeading}>⚡ 1-Tap Instant Demo Access</Text>
          <Text style={styles.demoSubtitle}>Select a role to login with seeded credentials</Text>

          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoPill}
              onPress={() => handleQuickDemo('customer')}
            >
              <Text style={styles.demoPillText}>🛒 Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, { backgroundColor: '#0284c7' }]}
              onPress={() => handleQuickDemo('delivery')}
            >
              <Text style={styles.demoPillText}>🛵 Delivery Partner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoPill, { backgroundColor: '#475569' }]}
              onPress={() => handleQuickDemo('admin')}
            >
              <Text style={styles.demoPillText}>🛠️ Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. customer@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  logoBox: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  logoEmoji: {
    fontSize: 52,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 4,
  },
  brandSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  demoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  demoHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoPill: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  demoPillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 13,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default LoginScreen;
