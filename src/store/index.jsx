import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import authReducer from './slices/authSlice';
import messageCountReducer from './slices/messageCountSlice';
import { combineReducers } from 'redux';
import tokenExpiryMiddleware from './middleware/tokenExpiryMiddleware';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'messageCount'], // persist auth and message counts
};

const rootReducer = combineReducers({
  auth: authReducer,
  messageCount: messageCountReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist

    }).concat(tokenExpiryMiddleware),

});

const persistor = persistStore(store);

export { store, persistor };
