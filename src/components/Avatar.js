import React, { useState } from "react";
import { profileUrl, initials } from "../config";

const COLORS = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#22c55e"];

function colorFor(name = "") {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return COLORS[h % COLORS.length];
}

// Shows the profile picture, or coloured initials when there is none (or it fails to load).
function Avatar({ user, size = 36, status }) {
    const [failed, setFailed] = useState(false);
    const src = profileUrl(user?.picture);
    return (
        <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: colorFor(user?.name) }}>
            {src && !failed ? (
                <img src={src} alt="" onError={() => setFailed(true)} />
            ) : (
                <span aria-hidden="true">{initials(user?.name)}</span>
            )}
            {status && <span className={`avatar-status ${status === "online" ? "is-online" : "is-offline"}`} />}
        </span>
    );
}

export default Avatar;
