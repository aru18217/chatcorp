import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Chatbot from "./Chatbot";
import toro from "../assets/toro.png";
import "./Home.css";

const FEATURES = [
    { icon: "fa-shield-halved", title: "AES-256 encryption", text: "Every message and file name is encrypted with AES-256 before it is stored on the server." },
    { icon: "fa-hashtag", title: "Channels for every team", text: "Announcements, departments, projects, and casual chat, each in its own room." },
    { icon: "fa-lock", title: "Locked meeting rooms", text: "Meeting rooms need a key, checked on the server, so only invited people get in." },
    { icon: "fa-envelope-circle-check", title: "OTP verification", text: "New accounts confirm their email with a one-time code that expires in 10 minutes." },
    { icon: "fa-paperclip", title: "File sharing", text: "Share documents in any room or direct message, up to 10 MB each." },
    { icon: "fa-user-shield", title: "Admin controls", text: "Admins can review chat activity and block accounts that break the rules." },
];

const RULES = [
    ["Professional communication", "Keep a professional tone and avoid slang in work channels."],
    ["Confidentiality", "Share sensitive information only in direct messages or locked rooms."],
    ["Relevance", "Post in the channel that fits the topic."],
    ["Availability", "Your online status updates automatically when you open or close the app."],
    ["Etiquette", "Keep messages short and don't spam."],
];

function Home() {
    const user = useSelector((state) => state.user);
    const ctaTo = user?.token ? "/chat" : "/login";

    return (
        <>
            <section className="hero">
                <div className="container-xl hero-grid">
                    <div>
                        <span className="secure-badge"><i className="fas fa-shield-halved" /> Encrypted with AES-256</span>
                        <h1 className="hero-title">
                            Connect with your team, <span>privately.</span>
                        </h1>
                        <p className="hero-text">ChatCorp keeps your company's conversations in one place: team channels, direct messages, locked meeting rooms, and file sharing.</p>
                        <div className="d-flex flex-wrap gap-3">
                            <Link to={ctaTo} className="btn btn-brand btn-lg">
                                {user?.token ? "Open chat" : "Log in"} <i className="fas fa-arrow-right ms-1" />
                            </Link>
                            {!user?.token && (
                                <Link to="/signup" className="btn btn-outline-brand btn-lg">Create account</Link>
                            )}
                        </div>
                    </div>

                    <div className="hero-mock" aria-hidden="true">
                        <div className="hero-mock__bar"><span /><span /><span /><em># Project-Based Rooms</em></div>
                        <div className="hero-mock__body">
                            <div className="bubble bubble--in"><b>Rina</b>Client deck v2 is ready for review 📎</div>
                            <div className="bubble bubble--out">Nice! Checking it now</div>
                            <div className="bubble bubble--in"><b>Dimas</b>Let's sync in Room Meeting 1A at 3 🔐</div>
                            <div className="bubble bubble--out">See you there 👍</div>
                        </div>
                        <div className="hero-mock__composer">Message #Project-Based Rooms <i className="fas fa-paper-plane" /></div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container-xl">
                    <h2 className="section-title">Everything your team needs to talk</h2>
                    <div className="feature-grid">
                        {FEATURES.map((f) => (
                            <article className="feature" key={f.title}>
                                <span className="feature-icon"><i className={`fas ${f.icon}`} /></span>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section--tint">
                <div className="container-xl two-col">
                    <div>
                        <h2 className="section-title text-start">Rules to chit-chat</h2>
                        <ol className="rules">
                            {RULES.map(([t, d]) => (
                                <li key={t}>
                                    <strong>{t}</strong>
                                    <span>{d}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="toro-card">
                        <img src={toro} alt="Toro, the ChatCorp helper bot" />
                        <h3>Meet Toro!</h3>
                        <p>Toro answers quick questions about using ChatCorp. Tap the bubble in the corner to say hi.</p>
                    </div>
                </div>
            </section>

            <footer className="site-footer">ChatCorp · Built with React, Node.js, Socket.IO and MongoDB</footer>
            <Chatbot />
        </>
    );
}

export default Home;
