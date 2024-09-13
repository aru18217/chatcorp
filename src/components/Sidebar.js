import React, { useContext, useEffect, useState } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import CaptchaVerification from "./Captcha"; 
import "./Sidebar.css";

function Sidebar() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, setMembers, members = [], setCurrentRoom, setRooms, privateMemberMsg, rooms = [], setPrivateMemberMsg, currentRoom } = useContext(AppContext);
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

    function joinRoom(room, isPublic = true) {
        if (!user) {
            return alert("Please login");
        }
        if (!isCaptchaVerified) {
            return alert("Please complete the CAPTCHA verification.");
        }
        socket.emit("join-room", room, currentRoom);
        setCurrentRoom(room);

        if (isPublic) {
            setPrivateMemberMsg(null);
        }
        // Dispatch for notifications
        dispatch(resetNotifications(room));
    }

    socket.off("notifications").on("notifications", (room) => {
        if (currentRoom !== room) dispatch(addNotifications(room));
    });

    useEffect(() => {
        if (user && isCaptchaVerified) {
            setCurrentRoom("general");
            getRooms();
            socket.emit("join-room", "general");
            socket.emit("new-user");
        }
    }, [user, isCaptchaVerified]);

    socket.off("new-user").on("new-user", (payload) => {
        setMembers(payload);
    });

    function getRooms() {
        fetch("http://localhost:5001/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((err) => console.error("Failed to fetch rooms:", err));
    }

    function orderIds(id1, id2) {
        if (id1 > id2) {
            return id1 + "-" + id2;
        } else {
            return id2 + "-" + id1;
        }
    }

    function handlePrivateMemberMsg(member) {
        if (!isCaptchaVerified) {
            return alert("Please complete the CAPTCHA verification.");
        }
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        joinRoom(roomId, false);
    }

    if (!user) {
        return null;
    }

    if (!isCaptchaVerified) {
        return <CaptchaVerification onVerify={setIsCaptchaVerified} />;
    }

    return (
        <>
            <h2>Available rooms</h2>
            <ListGroup>
                {rooms.map((room, idx) => (
                    <ListGroup.Item
                        key={idx}
                        onClick={() => joinRoom(room)}
                        active={room === currentRoom}
                        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                    >
                        {room} {currentRoom !== room && <span className="badge rounded-pill bg-primary">{user?.newMessages?.[room] || 0}</span>}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <h2>Members</h2>
            {members.map((member) => (
                <ListGroup.Item
                    key={member.id}
                    style={{ cursor: "pointer" }}
                    active={privateMemberMsg?._id === member?._id}
                    onClick={() => handlePrivateMemberMsg(member)}
                    disabled={member._id === user._id}
                >
                    <Row>
                        <Col xs={2} className="member-status">
                            <img src={`http://localhost:5001/uploads/profiles/${member.picture}`} className="member-status-img" alt="profile" />
                            {member.status === "online" ? (
                                <i className="fas fa-circle sidebar-online-status"></i>
                            ) : (
                                <i className="fas fa-circle sidebar-offline-status"></i>
                            )}
                        </Col>
                        <Col xs={9}>
                            {member.name}
                            {member._id === user?._id && " (You)"}
                            {member.status === "offline" && " (Offline)"}
                        </Col>
                        <Col xs={1}>
                            <span className="badge rounded-pill bg-primary">{user?.newMessages?.[orderIds(member._id, user._id)] || 0}</span>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </>
    );
}

export default Sidebar;
