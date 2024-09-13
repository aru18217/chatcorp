import React, { useContext, useState, useEffect } from "react";
import { Col, Container, Form, Row, Button, Spinner } from "react-bootstrap";
import { useLoginUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { AppContext } from "../context/appContext";
import emailjs from "@emailjs/browser";

function Login() { 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyCode, setCompanyCode] = useState("");
    const navigate = useNavigate();
    const { socket } = useContext(AppContext);
    const [loginUser, { isLoading, error }] = useLoginUserMutation();

    useEffect(() => emailjs.init("-sWaTSqzBPMN9yxFp"), []);
    const serviceId = "service_9ee69gq";
    const templateId = "template_7ctqvrx";

    function handleLogin(e) {
        e.preventDefault();
        
        loginUser({ email, password }).then(({ data }) => {
            console.log(data)
            if (data) {
                if (data.role === "admin" && data.authentication === "true") {
                    console.log("User is an admin, navigating to /admin...");
                    navigate("/admin");
                } else if (data.authentication === "true") {
                    console.log("User already authenticated, navigating to chat...");
                    navigate("/chat");
                } else {
                    console.log("User not authenticated, sending OTP...");
                    socket.emit("new-user");
    
                    emailjs.send(serviceId, templateId, {
                        name: data.name,
                        email: email,
                        code: data.code,
                    }).then(response => {
                        console.log("Email sent successfully:", response.status, response.text);
                    }).catch(err => {
                        console.error("Failed to send email:", err);
                    });
    
                    navigate("/auth");
                }
            }
        });
    }    

    return (
        <Container>
            <Row>
                <Col md={5} className="login__bg"></Col>
                <Col md={7} className="d-flex align-items-center justify-content-center flex-direction-column">
                    <Form style={{ width: "80%", maxWidth: 500 }} onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            {error && <p className="alert alert-danger">{error.data}</p>}
                            <Form.Label>Email address</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} value={email} required />
                            <Form.Text className="text-muted">We'll never share your email with anyone else.</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} value={password} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formCompanyCode">
                            <Form.Label>Company Code</Form.Label>
                            <Form.Control type="text" placeholder="Enter your company code" onChange={(e) => setCompanyCode(e.target.value)} value={companyCode} />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {isLoading ? <Spinner animation="grow" /> : "Login"}
                        </Button>
                        <div className="py-4">
                            <p className="text-center">
                                Don't have an account ? <Link to="/signup">Signup</Link>
                            </p>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
