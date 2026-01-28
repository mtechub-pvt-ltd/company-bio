// store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  tokenExpiry: null,
  user: null,
  email: null,
  otp: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { token, tokenExpiry, user, email } = action.payload;

      state.token = token;
      state.tokenExpiry = tokenExpiry;
      state.user = user;
      state.email = email;

      // Store non-sensitive info in localStorage
      localStorage.setItem(
        'auth',
        JSON.stringify({ token, tokenExpiry, user, email })
      );
    },

    setOTPInfo: (state, action) => {
      state.otp = action.payload.otp;
      state.email = action.payload.email;
    },

    clearAuth: (state) => {
      state.token = null;
      state.tokenExpiry = null;
      state.user = null;
      state.email = null;
      state.otp = null;

      localStorage.removeItem('auth');
    },

    restoreAuth: (state) => {
      const storedAuth = JSON.parse(localStorage.getItem('auth'));
      if (storedAuth) {
        const { token, tokenExpiry, user, email } = storedAuth;
        state.token = token;
        state.tokenExpiry = tokenExpiry;
        state.user = user;
        state.email = email;
      }
    },
  },
});

export const { setAuth, clearAuth, setOTPInfo, restoreAuth } = authSlice.actions;
export default authSlice.reducer;





