import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLoginUserMutation } from "../services/appApi";
import AuthLayout from "../components/AuthLayout";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const [loginUser, { isLoading, error }] = useLoginUserMutation();
    const notice = location.state?.notice;

    async function handleLogin(e) {
        e.preventDefault();
        const { data } = await loginUser({ email, password });
        if (!data) return;
        if (data.needsOtp) {
            navigate("/auth", { state: { email: data.email } });
            return;
        }
        navigate(data.role === "admin" ? "/admin" : location.state?.from || "/chat", { replace: true });
    }

    return (
        <AuthLayout title="Welcome back 👋" subtitle="Log in to continue chatting with your team.">
            {notice && <Alert variant="success">{notice}</Alert>}
            {error && <Alert variant="danger">{typeof error.data === "string" ? error.data : "Login failed. Please try again."}</Alert>}
            <Form onSubmit={handleLogin} noValidate={false}>
                <Form.Group className="mb-3" controlId="loginEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder="you@company.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} value={email} required />
                </Form.Group>
                <Form.Group className="mb-4" controlId="loginPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Your password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                </Form.Group>
                <Button type="submit" className="btn-brand w-100" disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : "Log in"}
                </Button>
            </Form>
            <p className="text-center mt-4 mb-0 text-muted">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </AuthLayout>
    );
}

export default Login;
