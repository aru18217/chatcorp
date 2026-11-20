import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications } from "../features/userSlice";
import Avatar from "./Avatar";
import "./Sidebar.css";

function Sidebar({ joinRoom, privateRoomId, onClose }) {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, setMembers, members = [], rooms = [], privateMemberMsg, currentRoom } = useContext(AppContext);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const onMembers = (payload) => setMembers(payload);
        const onNotify = (room) => {
            if (room !== currentRoom) dispatch(addNotifications(room));
        };
        socket.on("new-user", onMembers);
        socket.on("notifications", onNotify);
        return () => {
            socket.off("new-user", onMembers);
            socket.off("notifications", onNotify);
        };
    }, [socket, setMembers, dispatch, currentRoom]);

    const q = query.trim().toLowerCase();
    const visibleRooms = useMemo(() => rooms.filter((r) => r.name.toLowerCase().includes(q)), [rooms, q]);
    const visibleMembers = useMemo(
        () =>
            members
                .filter((m) => m._id !== user?._id && m.name?.toLowerCase().includes(q))
                .sort((a, b) => (a.status === "online") === (b.status === "online") ? a.name.localeCompare(b.name) : a.status === "online" ? -1 : 1),
        [members, user?._id, q]
    );
    const unread = (room) => user?.newMessages?.[room] || 0;
    const onlineCount = members.filter((m) => m.status === "online").length;

    return (
        <aside className="chat-sidebar">
            <div className="sidebar-head">
                <div className="d-flex align-items-center gap-2">
                    <Avatar user={user} size={38} status="online" />
                    <div className="lh-sm">
                        <div className="fw-semibold">{user?.name}</div>
                        <small className="sidebar-muted">{onlineCount} online now</small>
                    </div>
                </div>
                <button className="icon-btn d-md-none" onClick={onClose} aria-label="Close menu">
                    <i className="fas fa-xmark" />
                </button>
            </div>

            <div className="sidebar-search">
                <i className="fas fa-magnifying-glass" aria-hidden="true" />
                <input placeholder="Search rooms or people" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search rooms or people" />
            </div>

            <div className="sidebar-scroll">
                <p className="sidebar-label">Channels</p>
                <ul className="sidebar-list">
                    {visibleRooms.map((room) => (
                        <li key={room.name}>
                            <button className={`sidebar-item ${room.name === currentRoom ? "is-active" : ""}`} onClick={() => joinRoom(room.name)}>
                                <span className="sidebar-item__icon">{room.locked ? <i className="fas fa-lock" /> : "#"}</span>
                                <span className="sidebar-item__name">{room.name}</span>
                                {room.name !== currentRoom && unread(room.name) > 0 && <span className="unread">{unread(room.name)}</span>}
                            </button>
                        </li>
                    ))}
                    {!visibleRooms.length && <li className="sidebar-empty">No channels found</li>}
                </ul>

                <p className="sidebar-label">Direct messages</p>
                <ul className="sidebar-list">
                    {visibleMembers.map((member) => {
                        const roomId = privateRoomId(user._id, member._id);
                        return (
                            <li key={member._id}>
                                <button
                                    className={`sidebar-item ${privateMemberMsg?._id === member._id ? "is-active" : ""}`}
                                    onClick={() => joinRoom(roomId, { member })}
                                >
                                    <Avatar user={member} size={28} status={member.status} />
                                    <span className="sidebar-item__name">
                                        {member.name}
                                        {member.blocked && <span className="tag-blocked">blocked</span>}
                                    </span>
                                    {privateMemberMsg?._id !== member._id && unread(roomId) > 0 && <span className="unread">{unread(roomId)}</span>}
                                </button>
                            </li>
                        );
                    })}
                    {!visibleMembers.length && <li className="sidebar-empty">No people found</li>}
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;
