import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // In your addToCart function, add support for custom posters:
const addToCart = (item) => {
  console.log('Adding to cart:', item);
  setCartItems(prevItems => {
    // For custom posters, always treat them as separate items
    if (item.isCustom) {
      return [...prevItems, { ...item, quantity: item.quantity || 1 }];
    }

    // Regular items can be merged
    const existingItem = prevItems.find(cartItem =>
      cartItem.id === item.id && !cartItem.isCustom
    );

    if (existingItem) {
      return prevItems.map(cartItem =>
        cartItem.id === item.id && !cartItem.isCustom
          ? { ...cartItem, quantity: cartItem.quantity + (item.quantity || 1) }
          : cartItem
      );
    } else {
      return [...prevItems, { ...item, quantity: item.quantity || 1 }];
    }
  });
};

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    console.log('Clearing cart manually');
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;