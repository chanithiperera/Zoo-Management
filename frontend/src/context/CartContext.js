import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('zoo_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart', error);
    }
  };

  const saveCart = async (newCart) => {
    try {
      await AsyncStorage.setItem('zoo_cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error saving cart', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingItemIndex = cart.findIndex(
      (item) => item.product._id === product._id && item.product.selectedSize === product.selectedSize
    );
    let newCart;

    if (existingItemIndex > -1) {
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
    } else {
      newCart = [...cart, { product, quantity }];
    }

    setCart(newCart);
    saveCart(newCart);
  };

  const removeFromCart = (productId, size = null) => {
    const newCart = cart.filter(
      (item) => !(item.product._id === productId && item.product.selectedSize === size)
    );
    setCart(newCart);
    saveCart(newCart);
  };

  const updateQuantity = (productId, quantity, size = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const newCart = cart.map((item) =>
      item.product._id === productId && item.product.selectedSize === size
        ? { ...item, quantity }
        : item
    );
    setCart(newCart);
    saveCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const totalAmount = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
