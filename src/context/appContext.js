import { io } from "socket.io-client";
import React from "react";
import { API_URL } from "../config";

// The socket connects only after login, using the session token.
export const socket = io(API_URL, { autoConnect: false });

export function connectSocket(token) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
    if (socket.connected) socket.disconnect();
}

// Emits an event and resolves with the server's acknowledgement.
export function emitWithAck(event, ...args) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ ok: false, error: "Server did not respond. Please try again." }), 8000);
        socket.emit(event, ...args, (res) => {
            clearTimeout(timer);
            resolve(res || { ok: false });
        });
    });
}

export const AppContext = React.createContext();
