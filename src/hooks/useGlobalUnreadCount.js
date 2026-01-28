import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import url, { socketurl } from '../url';
import { setUnreadCounts } from '../store/slices/messageCountSlice';

/**
 * Global hook to fetch and maintain unread message counts across the app.
 * This hook should be used at the app level (e.g., in App.js) to ensure
 * unread counts are always available in the sidebar, regardless of which
 * page the user is on.
 */
const useGlobalUnreadCount = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const fetchIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Fetch unread counts from API
  const fetchUnreadCounts = useCallback(async () => {
    if (!token) return;

    try {
      const endpoint = `${url}messages/unread-counts/detailed`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.error && data.data) {
        const threadCounts = {};
        if (data.data.threadCounts) {
          data.data.threadCounts.forEach((thread) => {
            threadCounts[String(thread.threadId)] = thread.unreadCount || 0;
          });
        }

        // Calculate role-based counts from thread data
        const roleBased = {};
        if (data.data.threadCounts) {
          data.data.threadCounts.forEach((thread) => {
            const role = thread.role || thread.other_user_role || 'unknown';
            if (!roleBased[role]) {
              roleBased[role] = 0;
            }
            roleBased[role] += thread.unreadCount || 0;
          });
        }

        dispatch(
          setUnreadCounts({
            total: data.data.totalUnread || 0,
            threads: threadCounts,
            roleBased,
          })
        );

        console.log('✅ Global unread counts fetched:', data.data.totalUnread);
      }
    } catch (err) {
      console.error('❌ Error fetching global unread counts:', err);
    }
  }, [token, dispatch]);

  // Initialize socket connection for real-time updates
  const initSocket = useCallback(() => {
    if (!token || socketRef.current?.connected) return;

    // Clean up existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(socketurl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      console.log('🌐 Global socket connected for unread counts');
      // Fetch counts when socket connects
      fetchUnreadCounts();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Global socket disconnected:', reason);
    });

    // Listen for real-time count updates
    newSocket.on('total_unread_count_updated', (data) => {
      console.log('🔢 Global: Total unread count updated:', data);
      const threadCounts = {};
      if (data.threadCounts) {
        data.threadCounts.forEach((thread) => {
          threadCounts[String(thread.threadId)] = thread.unreadCount || 0;
        });
      }
      
      // Calculate role-based counts
      const roleBased = {};
      if (data.threadCounts) {
        data.threadCounts.forEach((thread) => {
          const role = thread.role || thread.other_user_role || 'unknown';
          if (!roleBased[role]) {
            roleBased[role] = 0;
          }
          roleBased[role] += thread.unreadCount || 0;
        });
      }

      dispatch(
        setUnreadCounts({
          total: data.totalUnread || 0,
          threads: threadCounts,
          roleBased,
        })
      );
    });

    newSocket.on('unread_count_updated', (data) => {
      console.log('🔢 Global: Thread unread count updated:', data);
      // Refetch all counts to ensure consistency
      fetchUnreadCounts();
    });

    // Listen for new messages to update count
    newSocket.on('new_message', () => {
      console.log('📬 New message received, refetching counts');
      // Small delay to allow backend to update counts
      setTimeout(fetchUnreadCounts, 500);
    });

    // Listen for messages read events
    newSocket.on('messages_read', () => {
      console.log('✅ Messages read, refetching counts');
      setTimeout(fetchUnreadCounts, 500);
    });

    socketRef.current = newSocket;
  }, [token, dispatch, fetchUnreadCounts]);

  // Initialize on mount and when token changes
  useEffect(() => {
    if (token && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // Fetch counts immediately on app load
      fetchUnreadCounts();
      
      // Initialize socket for real-time updates
      initSocket();

      // Set up periodic refresh as backup (every 60 seconds)
      fetchIntervalRef.current = setInterval(fetchUnreadCounts, 60000);
    }

    return () => {
      // Cleanup on unmount
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, [token, fetchUnreadCounts, initSocket]);

  // Handle token removal (logout)
  useEffect(() => {
    if (!token && socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isInitializedRef.current = false;
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
        fetchIntervalRef.current = null;
      }
    }
  }, [token]);

  // Re-fetch when window becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        fetchUnreadCounts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, fetchUnreadCounts]);

  return {
    refetchCounts: fetchUnreadCounts,
  };
};

export default useGlobalUnreadCount;
