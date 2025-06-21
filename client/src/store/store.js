import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/UserSlice';
import cartReducer from './slices/cartSlice';

// Load cart from localStorage
const loadCartFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
};

// Save cart to localStorage
const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (err) {}
};

const preloadedState = {
  cart: loadCartFromLocalStorage(),
};

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
  preloadedState,
});

// Subscribe to store changes and save cart to localStorage
store.subscribe(() => {
  saveCartToLocalStorage(store.getState().cart);
});
