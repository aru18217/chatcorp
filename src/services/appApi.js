import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// define a service user a base URL

const appApi = createApi({
    reducerPath: "appApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5001",
    }),

    endpoints: (builder) => ({
        // creating the user
        signupUser: builder.mutation({
            query: (user) => ({
                url: "/users",
                method: "POST",
                body: user,
            }),
        }),

        // login
        loginUser: builder.mutation({
            query: (user) => ({
                url: "/users/login",
                method: "POST",
                body: user,
            }),
        }),

        checkOTP: builder.mutation({
            query: (user) => ({
                url: "/users/otp",
                method: "POST",
                body: user,
            }),
        }),

        // logout
        logoutUser: builder.mutation({
            query: (payload) => ({
                url: "/logout",
                method: "DELETE",
                body: payload,
            }),
        }),

        getChatHistory: builder.query({
            query: (name) => name ? `/users/history?name=${name}` : `/users/history`,
        }),        

        getAllUsers: builder.query({
            query: () => "/users/all-users",
        }),

        blockUser: builder.mutation({
            query: ({ userId, blocked }) => ({
                url: `/users/block/${userId}`,
                method: "PUT",
                body: { blocked },
            }),
        }),        
    }),
});

export const { useSignupUserMutation, useLoginUserMutation, useCheckOTPMutation, useLogoutUserMutation, useGetChatHistoryQuery, useGetAllUsersQuery, useBlockUserMutation } = appApi;

export default appApi;
