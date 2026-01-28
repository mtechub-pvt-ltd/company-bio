import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../store/slices/authSlice';
import { scheduleAutoLogout } from '../helper_functions/authhelper';
import { toast } from 'react-hot-toast';

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
};

const TestLogin = () => {
  const dispatch = useDispatch();
  const tokenExpiry = useSelector((state) => state.auth.tokenExpiry);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleTestLogin = () => {
    const tokenExpiry = new Date(Date.now() + 5000).toISOString(); // expires in 5s

    // 1. Set auth
    dispatch(
      setAuth({
        token: 'dummy_token',
        tokenExpiry,
        user: { name: 'Test User' },
        email: 'test@example.com',
      })
    );

    // 2. Schedule auto logout
    scheduleAutoLogout(dispatch, tokenExpiry);

    // 3. Show login toast
    toast.success('Logged in for 5 seconds');
  };

  // ⏳ Countdown updater
  useEffect(() => {
    if (!tokenExpiry) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = new Date(tokenExpiry).getTime() - Date.now();
      setTimeLeft(remaining > 0 ? Math.floor(remaining / 1000) : 0);
    };

    updateTimer(); // run immediately
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [tokenExpiry]);

  return (
    <div style={{ margin: '20px' }}>
      <button onClick={handleTestLogin}>Test Login (5s expiry)</button>

      {timeLeft > 0 ? (
        <div>⏳ Time left: {formatTime(timeLeft)}</div>
      ) : (
        <div>🔒 Session expired</div>
      )}
    </div>
  );
};

export default TestLogin;
