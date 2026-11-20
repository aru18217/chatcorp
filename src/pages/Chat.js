import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import MessageForm from "../components/MessageForm";
import CaptchaVerification from "../components/Captcha";
import { AppContext, emitWithAck } from "../context/appContext";
import { resetNotifications } from "../features/userSlice";
import { API_URL } from "../config";
import "./Chat.css";

export function privateRoomId(id1, id2) {
    return id1 > id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
}

function Chat() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, currentRoom, setCurrentRoom, setRooms, rooms, setPrivateMemberMsg, setMessages, unlockedRooms, setUnlockedRooms } = useContext(AppContext);
    const [captchaOk, setCaptchaOk] = useState(() => sessionStorage.getItem("captchaOk") === "1");
    const [lockedPrompt, setLockedPrompt] = useState(null); // room waiting for a key
    const [joinError, setJoinError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const roomRef = useRef(currentRoom);
    roomRef.current = currentRoom;
    const joinRef = useRef(null);

    const joinRoom = useCallback(
        async (room, { member = null, password } = {}) => {
            setJoinError("");
            const meta = rooms.find((r) => r.name === room);
            const key = password ?? unlockedRooms[room];
            if (meta?.locked && !key) {
                setLockedPrompt(room);
                setSidebarOpen(false);
                return;
            }
            const res = await emitWithAck("join-room", room, currentRoom, key);
            if (!res.ok) {
                if (res.locked) {
                    setLockedPrompt(room);
                    setUnlockedRooms((u) => ({ ...u, [room]: undefined }));
                }
                setJoinError(res.error || "Could not join the room.");
                return;
            }
            if (meta?.locked) setUnlockedRooms((u) => ({ ...u, [room]: key }));
            setLockedPrompt(null);
            setMessages(res.messages || []);
            setCurrentRoom(room);
            setPrivateMemberMsg(member);
            setSidebarOpen(false);
            dispatch(resetNotifications(room));
        },
        [rooms, unlockedRooms, currentRoom, setCurrentRoom, setPrivateMemberMsg, setMessages, setUnlockedRooms, dispatch]
    );

    joinRef.current = joinRoom;

    // Load the room list once.
    useEffect(() => {
        fetch(`${API_URL}/rooms`)
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch(() => setJoinError("Cannot reach the chat server. Is it running?"));
    }, [setRooms]);

    // Join the first public room after the captcha, and again after a reconnect.
    useEffect(() => {
        if (!captchaOk || !rooms.length) return;
        const first = rooms.find((r) => !r.locked)?.name;
        const rejoin = () => {
            const target = roomRef.current || first;
            if (target) joinRef.current(target);
            socket.emit("new-user");
        };
        if (socket.connected) rejoin();
        socket.on("connect", rejoin);
        return () => socket.off("connect", rejoin);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [captchaOk, rooms.length]);

    function onCaptcha() {
        sessionStorage.setItem("captchaOk", "1");
        setCaptchaOk(true);
    }

    if (!captchaOk) {
        return (
            <div className="captcha-page">
                <CaptchaVerification onVerify={onCaptcha} />
            </div>
        );
    }

    return (
        <div className={`chat-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
            <Sidebar joinRoom={joinRoom} privateRoomId={privateRoomId} onClose={() => setSidebarOpen(false)} />
            <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
            <MessageForm
                user={user}
                lockedPrompt={lockedPrompt}
                joinError={joinError}
                onUnlock={(room, key) => joinRoom(room, { password: key })}
                onCancelUnlock={() => {
                    setLockedPrompt(null);
                    setJoinError("");
                }}
                onOpenSidebar={() => setSidebarOpen(true)}
            />
        </div>
    );
}

export default Chat;
