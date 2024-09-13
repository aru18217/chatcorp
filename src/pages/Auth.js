import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCheckOTPMutation } from "../services/appApi";
import "bootstrap/dist/css/bootstrap.min.css";

function Auth() {
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
    const [checkOTP, { isLoading, error }] = useCheckOTPMutation();

    function handleOtpSubmit(e) {
        e.preventDefault();
        checkOTP({ otp }).then(({ data }) => {
            if (data?.success) {
                navigate("/chat");
            } else {
                alert("Invalid OTP. Please try again.");
            }
        }).catch(err => {
            console.error("Error validating OTP:", err);
            alert("There was an error validating the OTP. Please try again.");
        });
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ maxWidth: "400px", width: "100%" }}>
                <div className="card-body">
                    <h5 className="card-title text-center">Verifikasi OTP</h5>
                    <p className="card-text text-center">
                        Silahkan cek email dan masukkan kode OTP untuk aktivasi akun yang telah dikirimkan ke email kamu.
                    </p>
                    <form onSubmit={handleOtpSubmit}>
                        <div className="mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Masukkan Kode OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? "Loading..." : "Submit"}
                            </button>
                        </div>
                    </form>
                    {error && <div className="alert alert-danger mt-3">Error: {error.message}</div>}
                </div>
            </div>
        </div>
    );
}

export default Auth;
