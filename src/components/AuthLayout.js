import React from "react";

// Two-column layout shared by Login, Signup and OTP pages.
function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="auth-page">
            <aside className="auth-aside" aria-hidden="true">
                <div className="auth-aside__inner">
                    <span className="secure-badge secure-badge--light">🔒 AES-256 encrypted messages</span>
                    <h2>Team chat that keeps company talk private.</h2>
                    <p>Channels for every team, direct messages, locked meeting rooms, and file sharing, all encrypted before they are stored.</p>
                    <div className="auth-preview">
                        <div className="bubble bubble--in">Draft for the client deck is in #Project-Based Rooms 📎</div>
                        <div className="bubble bubble--out">Got it, reviewing now!</div>
                        <div className="bubble bubble--in">Meeting 1A at 3 PM 🔐</div>
                    </div>
                </div>
            </aside>
            <main className="auth-main">
                <div className="auth-card">
                    <h1>{title}</h1>
                    {subtitle && <p className="text-muted mb-4">{subtitle}</p>}
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AuthLayout;
