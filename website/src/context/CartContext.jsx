import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      setSyncing(true);
      api.get('/user/cart')
        .then(({ data }) => setItems(data.data || []))
        .catch(() => { })
        .finally(() => setSyncing(false));
    } else {
      // For guests keep cart in local state (cleared on logout)
      setItems([]);
    }
  }, [isLoggedIn]);

  const addItem = useCallback(async (product, quantity = 1) => {
    if (isLoggedIn) {
      try {
        const { data } = await api.post('/user/cart', { productId: product._id, quantity });
        setItems(data.data);
      } catch { /* ignore */ }
    } else {
      // Guest: manage cart locally
      setItems(prev => {
        const existing = prev.find(i => i.product._id === product._id);
        if (existing) return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
        return [...prev, { product, quantity }];
      });
    }
  }, [isLoggedIn]);

  const updateItem = useCallback(async (productId, quantity) => {
    if (isLoggedIn) {
      try {
        const { data } = await api.put(`/user/cart/${productId}`, { quantity });
        setItems(data.data);
      } catch { /* ignore */ }
    } else {
      setItems(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
    }
  }, [isLoggedIn]);

  const removeItem = useCallback(async (productId) => {
    if (isLoggedIn) {
      try {
        const { data } = await api.delete(`/user/cart/${productId}`);
        setItems(data.data);
      } catch { /* ignore */ }
    } else {
      setItems(prev => prev.filter(i => i.product._id !== productId));
    }
  }, [isLoggedIn]);

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try { await api.delete('/user/cart'); } catch { /* ignore */ }
    }
    setItems([]);
  }, [isLoggedIn]);

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const subtotal = items.reduce((sum, i) => sum + ((i.product?.price || i.price || 0) * (i.quantity || 1)), 0);

  return (
    <CartContext.Provider value={{ items, totalItems, subtotal, syncing, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
