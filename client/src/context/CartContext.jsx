// src/context/CartContext.jsx
import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (poster, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === poster.id);
      if (existing) {
        return prev.map(item =>
          item.id === poster.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...poster, quantity }];
    });
  };

  const removeFromCart = (posterId) => {
    setCartItems(prev => prev.filter(item => item.id !== posterId));
  };

  const updateQuantity = (posterId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(posterId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === posterId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};