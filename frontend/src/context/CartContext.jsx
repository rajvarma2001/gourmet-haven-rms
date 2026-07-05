import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add Item to Cart
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i._id === item._id);
      if (existing) {
        return prevItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // Remove Item from Cart
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((i) => i._id !== itemId));
  };

  // Update Item Quantity
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  // Clear Cart
  const clearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setDiscountPercent(0);
    setPromoError('');
    localStorage.removeItem('cart');
  };

  // Promo Code Handler
  const applyPromo = (code) => {
    setPromoError('');
    const upperCode = code.toUpperCase().trim();
    if (upperCode === 'WELCOME10' || upperCode === 'GIFT10') {
      setPromoCode(upperCode);
      setDiscountPercent(0.10); // 10% Off
      return true;
    } else if (upperCode === 'EATS20') {
      setPromoCode(upperCode);
      setDiscountPercent(0.20); // 20% Off
      return true;
    } else {
      setPromoError('Invalid promo code. Try WELCOME10 or EATS20');
      return false;
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setDiscountPercent(0);
    setPromoError('');
  };

  // Calculate pricing breakdown
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% tax
  const deliveryFee = subtotal > 0 && subtotal < 40 ? 5.00 : 0; // Free delivery above $40
  const discountAmount = subtotal * discountPercent;
  const total = subtotal + tax + deliveryFee - discountAmount;
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        promoCode,
        promoError,
        discountPercent,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
