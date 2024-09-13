import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import Modal from 'react-modal';
import { useLogoutUserMutation } from '../services/appApi';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const user = useSelector((state) => state.user);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [logoutUser] = useLogoutUserMutation();
    const navigate = useNavigate();

    if (!user) {
        return <p>No user data available.</p>;
    }

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

    async function handleLogout(e) {
        e.preventDefault();
        await logoutUser(user);
        window.location.replace("/");
    }

    // async function handleHistory(){
    //     navigate("/history")
    // }

    return (
        <Container className="mt-4">
            <nav className="nav nav-borders">
                <a className="nav-link active ms-0" href="#profile">Profile</a>
            </nav>
            <hr className="mt-0 mb-4" />
            <Row>
                <Col xl={4}>
                    <Card className="mb-4 mb-xl-0">
                        <Card.Header>Profile Picture</Card.Header>
                        <Card.Body className="text-center">
                            <img
                                className="img-account-profile rounded-circle mb-2"
                                src={`http://localhost:5001/uploads/profiles/${user.picture}`}
                                alt="Profile"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={openModal}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={8}>
                    <Card className="mb-4">
                        <Card.Header>Account Details</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3" controlId="inputName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={user.name}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="inputEmailAddress">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={user.email}
                                        readOnly
                                    />
                                </Form.Group>
                                <Row className="gx-3 mb-3">
                                    <Col md={6}>
                                        <Form.Group controlId="inputStatus">
                                            <Form.Label>Status</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={user.status}
                                                readOnly
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group controlId="inputPassword">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={user.password}
                                                readOnly
                                            />
                                        </Form.Group>
                                    </Col>
                                    {/* <Col md={6}>
                                        <Form.Group controlId="history">
                                            <Form.Label>History</Form.Label>
                                            <Button onClick={handleHistory}>Lihat History</Button>
                                        </Form.Group>
                                    </Col> */}
                                </Row>

                                {/* Tambahkan tombol Logout di bawah form */}
                                <Button variant="danger" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal untuk menampilkan gambar dalam ukuran besar */}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={{ content: { display: 'flex', justifyContent: 'center', alignItems: 'center' } }}>
                <img
                    src={`http://localhost:5001/uploads/profiles/${user.picture}`}
                    alt="Profile"
                    style={{ maxWidth: '90%', maxHeight: '90%' }}
                    onClick={closeModal}
                />
            </Modal>
        </Container>
    );
}

export default Profile;
