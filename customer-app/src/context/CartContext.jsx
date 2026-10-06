import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, discount: 0, deliveryFee: 0, totalAmount: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const res = await cartAPI.getCart();
      if (res.data.success) {
        setCart(res.data.data.cart);
      }
    } catch (err) {
      console.error('Fetch cart error:', err);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.data.success) {
        setWishlist(res.data.data.wishlist.products || []);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart({ items: [], subtotal: 0, discount: 0, deliveryFee: 0, totalAmount: 0 });
      setWishlist([]);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartAPI.addToCart({ productId, quantity });
      if (res.data.success) {
        setCart(res.data.data.cart);
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartAPI.updateQuantity(itemId, quantity);
      if (res.data.success) {
        setCart(res.data.data.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartAPI.removeFromCart(itemId);
      if (res.data.success) {
        setCart(res.data.data.cart);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (productId) => {
    const isWishlisted = wishlist.some((p) => (p._id || p) === productId);
    try {
      if (isWishlisted) {
        const res = await wishlistAPI.removeFromWishlist(productId);
        if (res.data.success) {
          setWishlist(res.data.data.wishlist.products || []);
        }
      } else {
        const res = await wishlistAPI.addToWishlist(productId);
        if (res.data.success) {
          setWishlist(res.data.data.wishlist.products || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cartCount = cart.items ? cart.items.reduce((acc, curr) => acc + curr.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        wishlist,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
