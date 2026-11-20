import React, { useCallback, useEffect, useRef, useState } from "react";

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

function generateText() {
    let text = "";
    for (let i = 0; i < 3; i++) {
        text += String.fromCharCode(randomNumber(65, 90));
        text += String.fromCharCode(randomNumber(97, 122));
        text += String.fromCharCode(randomNumber(48, 57));
    }
    return [...text].sort(() => Math.random() - 0.5).join("");
}

function CaptchaVerification({ onVerify }) {
    const [userInput, setUserInput] = useState("");
    const [captchaText, setCaptchaText] = useState("");
    const [error, setError] = useState("");
    const canvasRef = useRef(null);

    const draw = useCallback((text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // light noise lines
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(99,102,241,${0.15 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(randomNumber(0, 60), randomNumber(0, 70));
            ctx.lineTo(randomNumber(160, 220), randomNumber(0, 70));
            ctx.stroke();
        }
        const colors = ["#1e1b4b", "#4f46e5", "#0f766e"];
        const space = 170 / text.length;
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            ctx.font = "bold 24px 'Courier New', monospace";
            ctx.fillStyle = colors[randomNumber(0, colors.length - 1)];
            ctx.translate(18 + i * space, randomNumber(36, 50));
            ctx.rotate((randomNumber(-20, 20) * Math.PI) / 180);
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    }, []);

    // Fixes the old bug where "reload" changed the code but not the picture.
    const refresh = useCallback(() => {
        const text = generateText();
        setCaptchaText(text);
        setUserInput("");
        draw(text);
    }, [draw]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    function handleSubmit(e) {
        e.preventDefault();
        if (userInput === captchaText) {
            onVerify(true);
        } else {
            setError("That doesn't match. Here's a new code.");
            refresh();
        }
    }

    return (
        <form className="captcha-card" onSubmit={handleSubmit}>
            <div className="captcha-icon"><i className="fas fa-robot" /></div>
            <h1>Quick check</h1>
            <p className="text-muted">Type the characters below to show you're human. Letters are case-sensitive.</p>
            <div className="captcha-row">
                <canvas ref={canvasRef} width="210" height="70" aria-label="Captcha image" />
                <button type="button" className="icon-btn" onClick={refresh} aria-label="New code">
                    <i className="fas fa-arrow-rotate-right" />
                </button>
            </div>
            <input
                className="form-control"
                type="text"
                value={userInput}
                onChange={(e) => {
                    setUserInput(e.target.value);
                    setError("");
                }}
                placeholder="Enter the characters"
                autoComplete="off"
                autoFocus
                required
            />
            {error && <p className="text-danger small mt-2 mb-0">{error}</p>}
            <button type="submit" className="btn btn-brand w-100 mt-3">Continue to chat</button>
        </form>
    );
}

export default CaptchaVerification;
