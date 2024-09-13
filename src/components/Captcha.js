import React, { useState, useEffect } from "react";

function CaptchaVerification({ onVerify }) {
    const [userInput, setUserInput] = useState("");
    const [captchaText, setCaptchaText] = useState("");
    const canvasRef = React.useRef(null);

    const textGenerator = () => {
        let generatedText = "";
        for (let i = 0; i < 3; i++) {
            generatedText += String.fromCharCode(randomNumber(65, 90));
            generatedText += String.fromCharCode(randomNumber(97, 122));
            generatedText += String.fromCharCode(randomNumber(48, 57));
        }
        return generatedText;
    };

    const randomNumber = (min, max) =>
        Math.floor(Math.random() * (max - min + 1) + min);

    const drawStringOnCanvas = (string) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const textColors = ["rgb(0,0,0)", "rgb(130,130,130)"];
        const letterSpace = 150 / string.length;
        for (let i = 0; i < string.length; i++) {
            const xInitialSpace = 25;
            ctx.font = "20px Roboto Mono";
            ctx.fillStyle = textColors[randomNumber(0, 1)];
            ctx.fillText(
                string[i],
                xInitialSpace + i * letterSpace,
                randomNumber(25, 40),
                100
            );
        }
    };

    useEffect(() => {
        const generatedText = textGenerator();
        const randomizedText = [...generatedText]
            .sort(() => Math.random() - 0.5)
            .join("");
        setCaptchaText(randomizedText);
        drawStringOnCanvas(randomizedText);
    }, []);

    const handleSubmit = () => {
        if (userInput === captchaText) {
            alert("CAPTCHA verified!");
            onVerify(true); // Trigger the callback to notify successful verification
        } else {
            alert("Incorrect CAPTCHA. Please try again.");
            const newCaptcha = textGenerator();
            setCaptchaText(newCaptcha);
            drawStringOnCanvas(newCaptcha);
        }
    };

    return (
        <div className="captcha-container" style={styles.container}>
            <canvas ref={canvasRef} width="200" height="70" style={styles.canvas}></canvas>
            <button onClick={() => setCaptchaText(textGenerator())} style={styles.reloadButton}>
                <i className="fa-solid fa-arrow-rotate-right"></i>
            </button>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter the text in the image"
                style={styles.input}
            />
            <button onClick={handleSubmit} style={styles.submitButton}>Submit</button>
        </div>
    );
}

// CSS styles
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        width: "250px",
        margin: "0 auto",
    },
    canvas: {
        border: "1px solid #000",
    },
    reloadButton: {
        backgroundColor: "#f0f0f0",
        border: "none",
        cursor: "pointer",
        padding: "5px",
        borderRadius: "5px",
    },
    input: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
    },
    submitButton: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "10px 5px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
    }
};

export default CaptchaVerification;
