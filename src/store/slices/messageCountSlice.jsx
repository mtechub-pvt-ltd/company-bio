import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Total unread count across all threads
  total: 0,
  // Count per thread: { threadId: count }
  threads: {},
  // Role-based counts: { role: count } - sums of thread counts per role
  roleBased: {},
};

const messageCountSlice = createSlice({
  name: 'messageCount',
  initialState,
  reducers: {
    // Set all unread counts (total, threads, roleBased)
    setUnreadCounts: (state, action) => {
      const { total, threads, roleBased } = action.payload;
      if (total !== undefined) state.total = total;
      if (threads !== undefined) state.threads = threads;
      if (roleBased !== undefined) state.roleBased = roleBased;
    },

    // Update thread count
    updateThreadCount: (state, action) => {
      const { threadId, count } = action.payload;
      state.threads[String(threadId)] = count || 0;
      state.total = Object.values(state.threads).reduce((sum, count) => sum + count, 0);
    },

    // Increment thread count
    incrementThreadCount: (state, action) => {
      const { threadId } = action.payload;
      if (!state.threads[String(threadId)]) {
        state.threads[String(threadId)] = 0;
      }
      state.threads[String(threadId)] += 1;
      state.total = Object.values(state.threads).reduce((sum, count) => sum + count, 0);
    },

    // Clear thread count
    clearThreadCount: (state, action) => {
      const { threadId } = action.payload;
      state.threads[String(threadId)] = 0;
      state.total = Object.values(state.threads).reduce((sum, count) => sum + count, 0);
    },

    // Update role-based counts
    updateRoleBasedCounts: (state, action) => {
      const { roleBased } = action.payload;
      state.roleBased = roleBased || {};
    },

    // Clear all counts
    clearAllCounts: (state) => {
      state.total = 0;
      state.threads = {};
      state.roleBased = {};
    },
  },
});

export const {
  setUnreadCounts,
  updateThreadCount,
  incrementThreadCount,
  clearThreadCount,
  updateRoleBasedCounts,
  clearAllCounts,
} = messageCountSlice.actions;

export default messageCountSlice.reducer;
