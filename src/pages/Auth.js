import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useCheckOTPMutation, useResendOTPMutation } from "../services/appApi";
import AuthLayout from "../components/AuthLayout";

function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [checkOTP, { isLoading, error }] = useCheckOTPMutation();
    const [resendOTP, { isLoading: resending }] = useResendOTPMutation();

    if (!email) return <Navigate to="/login" replace />;

    async function handleOtpSubmit(e) {
        e.preventDefault();
        const { data } = await checkOTP({ email, otp: otp.trim() });
        if (data?.success) {
            navigate("/login", { replace: true, state: { notice: "Account verified! Please log in." } });
        }
    }

    async function handleResend() {
        await resendOTP({ email });
        setMessage("A new code has been sent to your email.");
    }

    return (
        <AuthLayout title="Check your email 📬" subtitle={`We sent a 6-digit code to ${email}. It expires in 10 minutes.`}>
            {error && <Alert variant="danger">{error.data?.message || "Invalid or expired code."}</Alert>}
            {message && <Alert variant="info">{message}</Alert>}
            <Form onSubmit={handleOtpSubmit}>
                <Form.Group className="mb-4" controlId="otp">
                    <Form.Label>Verification code</Form.Label>
                    <Form.Control
                        className="otp-input"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        pattern="\d{6}"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                    />
                </Form.Group>
                <Button type="submit" className="btn-brand w-100" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : "Verify account"}
                </Button>
            </Form>
            <p className="text-center mt-4 mb-0 text-muted">
                Didn't get it?{" "}
                <Button variant="link" className="p-0 align-baseline" onClick={handleResend} disabled={resending}>
                    Resend code
                </Button>{" "}
                · <Link to="/login">Back to login</Link>
            </p>
        </AuthLayout>
    );
}

export default Auth;
