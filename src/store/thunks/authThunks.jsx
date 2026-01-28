// store/thunks/authThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { clearAuth } from '../slices/authSlice';
import url from '../../url';

export const checkToken = createAsyncThunk(
    'auth/checkToken',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const token = getState().auth.token;

        if (!token) return rejectWithValue('No token found');

        try {
            const response = await fetch(
                `${url}super-admin/profile`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            // console.log("checkTokenValidity in redux", data);

            if (!data.error === false || !data.error === "false") {
                dispatch(clearAuth());
                return rejectWithValue('Invalid token');
            }

            return data;
        } catch (error) {
            dispatch(clearAuth());
            return rejectWithValue('Token check failed');
        }
    }
);
