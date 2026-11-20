import { createSlice } from "@reduxjs/toolkit";
import appApi from "../services/appApi";

export const userSlice = createSlice({
    name: "user",
    initialState: null,
    reducers: {
        addNotifications: (state, { payload }) => {
            if (!state) return;
            state.newMessages = state.newMessages || {};
            state.newMessages[payload] = (state.newMessages[payload] || 0) + 1;
        },
        resetNotifications: (state, { payload }) => {
            if (state?.newMessages) delete state.newMessages[payload];
        },
        // Clears the session locally (e.g. expired token).
        clearSession: () => null,
    },

    extraReducers: (builder) => {
        // Only a verified login (one that returns a token) creates a session.
        builder.addMatcher(appApi.endpoints.loginUser.matchFulfilled, (state, { payload }) =>
            payload?.token ? { newMessages: {}, ...payload } : state
        );
        builder.addMatcher(appApi.endpoints.logoutUser.matchFulfilled, () => null);
        builder.addMatcher(appApi.endpoints.logoutUser.matchRejected, () => null);
    },
});

export const { addNotifications, resetNotifications, clearSession } = userSlice.actions;
export default userSlice.reducer;
