import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../config";

const appApi = createApi({
    reducerPath: "appApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().user?.token;
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Users"],

    endpoints: (builder) => ({
        // body is FormData (name, email, password, optional picture)
        signupUser: builder.mutation({
            query: (formData) => ({ url: "/users", method: "POST", body: formData }),
        }),

        loginUser: builder.mutation({
            query: (user) => ({ url: "/users/login", method: "POST", body: user }),
        }),

        checkOTP: builder.mutation({
            query: ({ email, otp }) => ({ url: "/users/otp", method: "POST", body: { email, otp } }),
        }),

        resendOTP: builder.mutation({
            query: ({ email }) => ({ url: "/users/resend-otp", method: "POST", body: { email } }),
        }),

        logoutUser: builder.mutation({
            query: (payload) => ({ url: "/users/logout", method: "POST", body: payload }),
        }),

        getChatHistory: builder.query({
            query: (name) => (name ? `/users/history?name=${encodeURIComponent(name)}` : `/users/history`),
        }),

        getAllUsers: builder.query({
            query: () => "/users/all-users",
            providesTags: ["Users"],
        }),

        blockUser: builder.mutation({
            query: ({ userId, blocked }) => ({ url: `/users/block/${userId}`, method: "PUT", body: { blocked } }),
            invalidatesTags: ["Users"],
        }),
    }),
});

export const {
    useSignupUserMutation,
    useLoginUserMutation,
    useCheckOTPMutation,
    useResendOTPMutation,
    useLogoutUserMutation,
    useGetChatHistoryQuery,
    useGetAllUsersQuery,
    useBlockUserMutation,
} = appApi;

export default appApi;
