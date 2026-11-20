import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { AppContext, emitWithAck } from "../context/appContext";
import { API_URL, documentUrl, displayFileName } from "../config";
import Avatar from "./Avatar";
import "./MessageForm.css";

const MAX_FILE = 10 * 1024 * 1024;

function formattedDate(d = new Date()) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${d.getFullYear()}`;
}

function formattedTime(d = new Date()) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function friendlyDate(mmddyyyy) {
    const [mm, dd, yyyy] = String(mmddyyyy).split("/").map(Number);
    if (!yyyy) return mmddyyyy;
    const d = new Date(yyyy, mm - 1, dd);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function MessageForm({ user, lockedPrompt, joinError, onUnlock, onCancelUnlock, onOpenSidebar }) {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);
    const [roomKey, setRoomKey] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const { socket, currentRoom, setMessages, messages, privateMemberMsg } = useContext(AppContext);
    const messageEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const isBlocked = user?.blocked === true;

    useEffect(() => {
        const onMessages = (roomMessages) => setMessages(roomMessages);
        socket.on("room-messages", onMessages);
        return () => socket.off("room-messages", onMessages);
    }, [socket, setMessages]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    useEffect(() => {
        setRoomKey("");
    }, [lockedPrompt]);

    function handleFileChange(e) {
        const selected = e.target.files[0];
        e.target.value = "";
        if (!selected) return;
        if (selected.size > MAX_FILE) {
            setSendError("Attachments can be up to 10 MB.");
            return;
        }
        setSendError("");
        setFile(selected);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if ((!message.trim() && !file) || sending || !currentRoom) return;
        setSending(true);
        setSendError("");
        try {
            let filename = null;
            if (file) {
                const formData = new FormData();
                formData.append("pdf", file);
                const response = await fetch(`${API_URL}/send`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${user.token}` },
                    body: formData,
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.message || "File upload failed.");
                filename = data.filename;
            }
            const res = await emitWithAck("message-room", currentRoom, message.trim(), formattedTime(), formattedDate(), filename);
            if (!res.ok) throw new Error(res.error || "Message could not be sent.");
            setMessage("");
            setFile(null);
        } catch (err) {
            setSendError(err.message);
        } finally {
            setSending(false);
        }
    }

    const roomTitle = privateMemberMsg?._id ? privateMemberMsg.name : currentRoom;

    return (
        <section className="chat-main">
            <header className="chat-header">
                <button className="icon-btn d-md-none" onClick={onOpenSidebar} aria-label="Open rooms and people">
                    <i className="fas fa-bars" />
                </button>
                {privateMemberMsg?._id ? (
                    <Avatar user={privateMemberMsg} size={40} status={privateMemberMsg.status} />
                ) : (
                    <span className="room-glyph">{lockedPrompt ? <i className="fas fa-lock" /> : "#"}</span>
                )}
                <div className="flex-grow-1 min-w-0">
                    <h2 className="chat-title">{lockedPrompt || roomTitle || "Choose a room"}</h2>
                    <p className="chat-subtitle">
                        {privateMemberMsg?._id ? (privateMemberMsg.status === "online" ? "Online" : "Offline") : "Channel"}
                    </p>
                </div>
                <span className="secure-badge" title="Messages are encrypted with AES-256 before they are stored on the server">
                    <i className="fas fa-shield-halved" /> AES-256
                </span>
            </header>

            {lockedPrompt ? (
                <div className="room-lock">
                    <div className="room-lock__card">
                        <div className="room-lock__icon"><i className="fas fa-lock" /></div>
                        <h3>{lockedPrompt} is locked</h3>
                        <p className="text-muted">Enter the meeting room key to join.</p>
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onUnlock(lockedPrompt, roomKey);
                            }}
                        >
                            <Form.Control type="password" placeholder="Room key" value={roomKey} onChange={(e) => setRoomKey(e.target.value)} autoFocus required />
                            {joinError && <p className="text-danger small mt-2 mb-0">{joinError}</p>}
                            <div className="d-flex gap-2 mt-3">
                                <Button variant="light" className="flex-grow-1" onClick={onCancelUnlock}>Cancel</Button>
                                <Button type="submit" className="btn-brand flex-grow-1">Unlock</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            ) : (
                <>
                    <div className="messages-output" aria-live="polite">
                        {joinError && <div className="chat-alert">{joinError}</div>}
                        {currentRoom && messages.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state__icon">💬</div>
                                <p className="fw-semibold mb-1">No messages yet</p>
                                <p className="text-muted small">Say hello to start the conversation.</p>
                            </div>
                        )}
                        {messages.map(({ _id: date, messagesByDate }) => (
                            <div key={date}>
                                <div className="date-divider"><span>{friendlyDate(date)}</span></div>
                                {messagesByDate?.map(({ _id, content, time, from: sender, file: attachment }, idx) => {
                                    const mine = sender?._id === user?._id;
                                    const prev = messagesByDate[idx - 1];
                                    const grouped = prev && prev.from?._id === sender?._id;
                                    return (
                                        <div className={`msg ${mine ? "msg--mine" : "msg--theirs"} ${grouped ? "msg--grouped" : ""}`} key={_id || idx}>
                                            {!mine && <div className="msg-avatar">{!grouped && <Avatar user={sender} size={32} />}</div>}
                                            <div className="msg-body">
                                                {!mine && !grouped && <div className="msg-sender">{sender?.name}</div>}
                                                <div className="msg-bubble">
                                                    {content && <p className="msg-text">{content}</p>}
                                                    {attachment && (
                                                        <a className="msg-file" href={documentUrl(attachment)} target="_blank" rel="noopener noreferrer">
                                                            <i className="fas fa-file-lines" />
                                                            <span>{displayFileName(attachment)}</span>
                                                        </a>
                                                    )}
                                                    <span className="msg-time">{time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div ref={messageEndRef} />
                    </div>

                    <footer className="composer-wrap">
                        {isBlocked && <div className="chat-alert mb-2">Your account is blocked by an admin. You can read messages but cannot send new ones.</div>}
                        {sendError && <div className="chat-alert mb-2">{sendError}</div>}
                        {file && (
                            <div className="file-chip">
                                <i className="fas fa-paperclip" /> {file.name}
                                <button type="button" onClick={() => setFile(null)} aria-label="Remove attachment">
                                    <i className="fas fa-xmark" />
                                </button>
                            </div>
                        )}
                        <Form onSubmit={handleSubmit} className="composer">
                            <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} disabled={isBlocked} />
                            <button type="button" className="icon-btn" onClick={() => fileInputRef.current?.click()} disabled={isBlocked || !currentRoom} aria-label="Attach a file">
                                <i className="fas fa-paperclip" />
                            </button>
                            <input
                                className="composer-input"
                                type="text"
                                placeholder={currentRoom ? `Message ${privateMemberMsg?._id ? privateMemberMsg.name : "#" + currentRoom}` : "Choose a room to start"}
                                disabled={isBlocked || !currentRoom}
                                value={message}
                                maxLength={5000}
                                onChange={(e) => setMessage(e.target.value)}
                                aria-label="Message"
                            />
                            <button type="submit" className="send-btn" disabled={isBlocked || sending || (!message.trim() && !file)} aria-label="Send">
                                {sending ? <Spinner animation="border" size="sm" /> : <i className="fas fa-paper-plane" />}
                            </button>
                        </Form>
                    </footer>
                </>
            )}
        </section>
    );
}

export default MessageForm;
