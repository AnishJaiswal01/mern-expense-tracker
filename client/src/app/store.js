import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import transactionReducer from '../features/transactions/transactionSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
  },
});

export default store;
