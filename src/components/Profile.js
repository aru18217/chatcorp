import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Container, Button } from "react-bootstrap";
import Modal from "react-modal";
import { useLogoutUserMutation } from "../services/appApi";
import { profileUrl } from "../config";
import Avatar from "./Avatar";

Modal.setAppElement("#root");

function Profile() {
    const user = useSelector((state) => state.user);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [logoutUser] = useLogoutUserMutation();

    async function handleLogout(e) {
        e.preventDefault();
        await logoutUser({ newMessages: user?.newMessages || {} });
        window.location.replace("/");
    }

    const picture = profileUrl(user.picture);

    return (
        <Container className="page">
            <div className="profile-card">
                <button className="profile-photo" onClick={() => picture && setModalIsOpen(true)} disabled={!picture} aria-label="View profile picture">
                    <Avatar user={user} size={120} />
                </button>
                <h1 className="h3 mb-1">{user.name}</h1>
                <p className="text-muted mb-4">{user.email}</p>

                <dl className="profile-meta">
                    <div>
                        <dt>Status</dt>
                        <dd><span className="dot dot--online" /> Online</dd>
                    </div>
                    <div>
                        <dt>Role</dt>
                        <dd className="text-capitalize">{user.role}</dd>
                    </div>
                    <div>
                        <dt>Account</dt>
                        <dd>{user.blocked ? <span className="text-danger">Blocked</span> : "Active"}</dd>
                    </div>
                </dl>

                <Button variant="outline-danger" onClick={handleLogout}>
                    <i className="fas fa-right-from-bracket me-2" />
                    Logout
                </Button>
            </div>

            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="photo-modal" overlayClassName="photo-modal__overlay">
                <img src={picture} alt={`${user.name}'s profile`} onClick={() => setModalIsOpen(false)} />
            </Modal>
        </Container>
    );
}

export default Profile;
