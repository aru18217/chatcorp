import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSignupUserMutation } from "../services/appApi";
import AuthLayout from "../components/AuthLayout";
import botImg from "../assets/bot.jpg";

const MAX_IMAGE = 1024 * 1024;

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState("");
    const [signupUser, { isLoading, error }] = useSignupUserMutation();
    const navigate = useNavigate();

    function validateImg(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setImageError("Please choose a PNG, JPG, or WEBP image.");
            return;
        }
        if (file.size >= MAX_IMAGE) {
            setImageError("Max file size is 1 MB.");
            return;
        }
        setImageError("");
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSignup(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("password", password);
        if (image) formData.append("picture", image);

        const { data } = await signupUser(formData);
        if (data?.needsOtp) navigate("/auth", { state: { email: data.email } });
    }

    return (
        <AuthLayout title="Create your account" subtitle="Join your team's workspace in under a minute.">
            {error && <Alert variant="danger">{typeof error.data === "string" ? error.data : "Sign up failed. Please try again."}</Alert>}
            <Form onSubmit={handleSignup}>
                <div className="signup-avatar">
                    <img src={imagePreview || botImg} alt="Profile preview" />
                    <label htmlFor="image-upload" className="signup-avatar__btn" title="Upload profile picture">
                        <i className="fas fa-camera" aria-hidden="true" />
                        <span className="visually-hidden">Upload profile picture</span>
                    </label>
                    <input type="file" id="image-upload" hidden accept="image/png, image/jpeg, image/webp" onChange={validateImg} />
                </div>
                {imageError && <p className="text-danger small text-center">{imageError}</p>}
                <Form.Group className="mb-3" controlId="signupName">
                    <Form.Label>Full name</Form.Label>
                    <Form.Control type="text" placeholder="Your name" autoComplete="name" onChange={(e) => setName(e.target.value)} value={name} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="signupEmail">
                    <Form.Label>Work email</Form.Label>
                    <Form.Control type="email" placeholder="you@company.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
                </Form.Group>
                <Form.Group className="mb-4" controlId="signupPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="At least 6 characters" autoComplete="new-password" minLength={6} onChange={(e) => setPassword(e.target.value)} value={password} required />
                </Form.Group>
                <Button type="submit" className="btn-brand w-100" disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : "Create account"}
                </Button>
            </Form>
            <p className="text-center mt-4 mb-0 text-muted">
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </AuthLayout>
    );
}

export default Signup;
