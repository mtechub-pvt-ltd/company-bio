// utils/authHelper.js
import { clearAuth } from '../store/slices/authSlice';
import { toast } from 'react-hot-toast';

let logoutTimer;

/**
 * Schedule automatic logout when token expires
 * @param {function} dispatch - Redux dispatch
 * @param {string} tokenExpiry - ISO string of token expiry
 */
export const scheduleAutoLogout = (dispatch, tokenExpiry) => {
  if (logoutTimer) clearTimeout(logoutTimer);

  if (!tokenExpiry) return;

  const expiryTime = new Date(tokenExpiry).getTime() - new Date().getTime();

  if (expiryTime <= 0) {
    dispatch(clearAuth());
    toast.error('Session expired. Please login again.');
    return;
  }

  logoutTimer = setTimeout(() => {
    dispatch(clearAuth());
    toast.error('Session expired. Please login again.');
  }, expiryTime);
};

/**
 * Optional: manually clear logout timer
 */
export const clearAutoLogout = () => {
  if (logoutTimer) clearTimeout(logoutTimer);
};
