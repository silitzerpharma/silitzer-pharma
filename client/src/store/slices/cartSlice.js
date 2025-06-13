import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart(state, action) {
      const item = state.find(p => p._id === action.payload._id);
      if (item) {
        item.quantity += 1;
      } else {
        state.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action) {
      return state.filter(p => p._id !== action.payload);
    },
    increaseQuantity(state, action) {
      const item = state.find(p => p._id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decreaseQuantity(state, action) {
      const item = state.find(p => p._id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        // Optionally remove item if quantity reaches 0
        return state.filter(p => p._id !== action.payload);
      }
    },
    clearCart() {
      return [];
    },
  },
});

export const selectTotalCartQuantity = (state) =>
  state.cart.reduce((total, item) => total + item.quantity, 0);
export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
