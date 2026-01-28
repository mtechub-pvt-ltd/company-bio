import { clearAuth } from "../slices/authSlice";

const tokenExpiryMiddleware = ({ dispatch, getState }) => (next) => (action) => {
    const result = next(action);

    const state = getState();
    const { token, tokenExpiry } = state.auth;

    if (token && tokenExpiry && Date.now() > tokenExpiry) {
        dispatch(clearAuth());
    }

    return result;
};

export default tokenExpiryMiddleware;
