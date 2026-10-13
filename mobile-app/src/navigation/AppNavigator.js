import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../styles/theme';
import { useCart } from '../context/CartContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import SmartExpiryScreen from '../screens/SmartExpiryScreen';
import HouseholdPantryScreen from '../screens/HouseholdPantryScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import DeliveryPartnerScreen from '../screens/DeliveryPartnerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ label, icon, focused, badge }) => (
  <View style={styles.tabIconContainer}>
    <Text style={styles.tabEmoji}>{icon}</Text>
    {badge > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

const MainTabs = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Shop" icon="🏪" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Categories" icon="🍱" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SmartExpiryTab"
        component={SmartExpiryScreen}
        options={{
          tabBarLabel: 'Expiry Tracker',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Expiry" icon="⏱️" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="HouseholdPantryTab"
        component={HouseholdPantryScreen}
        options={{
          tabBarLabel: 'Pantry',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Pantry" icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Cart" icon="🛒" focused={focused} badge={itemCount} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon label="Account" icon="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="SmartExpiry" component={SmartExpiryScreen} />
      <Stack.Screen name="HouseholdPantry" component={HouseholdPantryScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="DeliveryPartner" component={DeliveryPartnerScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default AppNavigator;
