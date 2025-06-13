import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null  
  // { name: 'John', role: 'admin' }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
