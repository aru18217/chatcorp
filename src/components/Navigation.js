import React from "react";
import { Nav, Navbar, Container, NavDropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useLocation } from "react-router-dom";
import { useLogoutUserMutation } from "../services/appApi";
import Avatar from "./Avatar";
import logo from "../assets/logo-f.png";

function Navigation() {
    const user = useSelector((state) => state.user);
    const [logoutUser] = useLogoutUserMutation();
    const { pathname } = useLocation();

    async function handleLogout(e) {
        e.preventDefault();
        await logoutUser({ newMessages: user?.newMessages || {} });
        window.location.replace("/");
    }

    return (
        <Navbar expand="lg" className={`app-nav ${pathname === "/chat" ? "app-nav--compact" : ""}`}>
            <Container fluid="xl">
                <LinkContainer to="/">
                    <Navbar.Brand className="brand">
                        <img src={logo} alt="" />
                        <span>ChatCorp</span>
                    </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav">
                    <Nav className="ms-auto align-items-lg-center gap-lg-1">
                        {user?.token && (
                            <LinkContainer to="/chat">
                                <Nav.Link>Chat</Nav.Link>
                            </LinkContainer>
                        )}
                        {user?.role === "admin" && (
                            <>
                                <LinkContainer to="/history">
                                    <Nav.Link>History</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/admin">
                                    <Nav.Link>Users</Nav.Link>
                                </LinkContainer>
                            </>
                        )}
                        {!user?.token && (
                            <>
                                <LinkContainer to="/login">
                                    <Nav.Link>Login</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/signup">
                                    <Nav.Link className="btn-pill">Get started</Nav.Link>
                                </LinkContainer>
                            </>
                        )}
                        {user?.token && (
                            <NavDropdown
                                align="end"
                                id="user-menu"
                                title={
                                    <span className="d-inline-flex align-items-center gap-2">
                                        <Avatar user={user} size={30} />
                                        <span className="fw-semibold">{user.name}</span>
                                    </span>
                                }
                            >
                                <LinkContainer to="/profile">
                                    <NavDropdown.Item>Profile</NavDropdown.Item>
                                </LinkContainer>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation;
