import { configureStore } from '@reduxjs/toolkit';

import  userReducer  from './slices/UserSlice';
import cartReducer from './slices/cartSlice'

export const store = configureStore({
  reducer: {
     user: userReducer,
     cart: cartReducer,
  },
});
