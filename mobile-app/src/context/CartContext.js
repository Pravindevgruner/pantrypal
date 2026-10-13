import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('userCart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load local cart:', e);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem('userCart', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => (i.product._id || i.product.id) === (product._id || product.id)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        (item.product._id || item.product.id) === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) =>
      prev.filter((item) => (item.product._id || item.product.id) !== productId)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
