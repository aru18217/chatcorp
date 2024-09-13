import React from "react";
import { Row, Col, Button, Form, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import Chatbot from './Chatbot'; // Import Chatbot
import "./Home.css";

function Home() {
    return (
        <>
            <Row>
                <Col md={6} className="d-flex flex-direction-column align-items-center justify-content-center">
                    <div>
                        <h1>Connect with your team</h1>
                        <p>Chat App keeps you in touch with your company</p>
                        <LinkContainer to="/chat">
                            <Button variant="success">
                                Login <i className="fas fa-comments home-message-icon"></i>
                            </Button>
                        </LinkContainer>
                    </div>
                </Col>
                <Col md={6} className="home__bg space-between"></Col>
                <Col md={6} className="home__bg1 space-between"></Col>
                <Col md={6} className="d-flex flex-direction-column align-items-center justify-content-center space-between">
                    <div>
                        <div>
                            <h3>Rules to Chit - Chat :</h3>
                            <p>1. Professional Communication: Maintain a professional tone, avoiding slang, emojis, and abbreviations.</p>
                            <p>2. Confidentiality: Share sensitive information only in private messages, adhering to company data protection policies.</p>
                            <p>3. Relevance: Post messages in appropriate channels for relevant discussions.</p>
                            <p>4. Availability: Accurately set your status to indicate availability.</p>
                            <p>5. Etiquette: Keep messages concise, avoid spamming, and use @mentions sparingly.</p>
                        </div>
                    </div>
                </Col>
                <Col md={6} className="d-flex flex-direction-column align-items-center justify-content-center space-between">
                    <div>
                        <div>
                            <h3>Meet Toro!</h3>
                            <p>Toro will help you guiding how to chat in ChatCorp</p>
                        </div>
                    </div>
                </Col>
                <Col md={6} className="home__bg2 space-between"></Col>
                
            </Row>
            <Container fluid className="contact-us-section">
                <Row>
                    <Col md={12} className="d-flex flex-direction-column align-items-center justify-content-center">
                        <div className="contact-form-container">
                            <h2>Contact Us</h2>
                            <Form>
                                <Form.Group controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" placeholder="Enter your name" />
                                </Form.Group>
                                <Form.Group controlId="formEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Enter your email" />
                                </Form.Group>
                                <Form.Group controlId="formMessage">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Enter your message" />
                                </Form.Group>
                                <Button variant="info" type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>
            <Chatbot /> {/* Tambahkan komponen Chatbot */}
        </>
    );
}

export default Home;
