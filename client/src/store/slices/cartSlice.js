import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart(state, action) {
      const item = state.find(p => p._id === action.payload._id);
      const incomingQty = action.payload.quantity || 1;

      if (item) {
        item.quantity += incomingQty;
      } else {
        state.push({ ...action.payload, quantity: incomingQty });
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
        return state.filter(p => p._id !== action.payload);
      }
    },
    clearCart() {
      return [];
    },
    setQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.find(p => p._id === productId);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
    },
  },
});

// Selector for total quantity in cart
export const selectTotalCartQuantity = (state) =>
  state.cart.reduce((total, item) => total + item.quantity, 0);

// Export actions
export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setQuantity,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
