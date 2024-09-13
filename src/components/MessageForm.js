import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import "./MessageForm.css";

function MessageForm() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [roomKey, setRoomKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const user = useSelector((state) => state.user);
  const { socket, currentRoom, setMessages, messages, privateMemberMsg } =
    useContext(AppContext);
  const messageEndRef = useRef(null);

  console.log(user)

  // Daftar ruangan yang terkunci dan kunci default
  const lockedRooms = {
    'Room Meeting 1A': '12345',
    'Room Meeting 1B': '12345',
    'Room Meeting 1C': '12345'
  };

  useEffect(() => {
    scrollToBottom();
    if (lockedRooms[currentRoom] && roomKey !== lockedRooms[currentRoom]) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [messages, currentRoom, roomKey]);

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();

    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();

    day = day.length > 1 ? day : "0" + day;

    return month + "/" + day + "/" + year;
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message && !file) return;

    const today = new Date();
    const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const roomId = currentRoom;
    const todayDate = getFormattedDate();

    try {
      if (file) {
        const formData = new FormData();
        formData.append('pdf', file);

        const response = await fetch('http://localhost:5001/send', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          socket.emit("message-room", roomId, message, user, time, todayDate, data.filename);
          setFile(null);
        } else {
          console.error("File upload failed");
        }
      } else {
        const response = await fetch('http://localhost:5001/sendText', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message }),
        });

        if (response.ok) {
          const data = await response.json();
          socket.emit("message-room", roomId, message, user, time, todayDate);
        } else {
          console.error("Message send failed");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setMessage("");
  };

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleKeySubmit(e) {
    e.preventDefault();
    if (roomKey === lockedRooms[currentRoom]) {
      setIsAuthorized(true);
    } else {
      alert("Kunci salah. Akses ditolak.");
    }
  }

  socket.off("room-messages").on("room-messages", (roomMessages) => {
    setMessages(roomMessages);
  });

  return (
    <>
      {/* Form Penguncian Ruangan */}
      {lockedRooms[currentRoom] && !isAuthorized && (
        <Form onSubmit={handleKeySubmit}>
          <Form.Group>
            <Form.Label>Masukkan Kunci Ruangan:</Form.Label>
            <Form.Control
              type="password"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value)}
              placeholder="Masukkan kunci"
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      )}

      {isAuthorized && (
        <>
          <div className="messages-output">
            {user && !privateMemberMsg?._id && (
              <div className="alert alert-info">
                You are in the {currentRoom} room
              </div>
            )}
            {user && privateMemberMsg?._id && (
              <>
                <div className="alert alert-info conversation-info">
                  <div>
                    Your conversation with {privateMemberMsg.name}{" "}
                    <img
                      src={`http://localhost:5001/uploads/profiles/${privateMemberMsg.picture}`}
                      className="conversation-profile-pic"
                      alt="."
                    />
                  </div>
                </div>
              </>
            )}
            {!user && <div className="alert alert-danger">Please login</div>}

            {user &&
              messages.map(({ _id: date, messagesByDate }, idx) => (
                <div key={idx}>
                  <p className="alert alert-info text-center message-date-indicator">
                    {date}
                  </p>
                  {messagesByDate?.map(
                    ({ content, time, from: sender, file }, msgIdx) => (
                      <div
                        className={
                          sender?.email === user?.email
                            ? "message"
                            : "incoming-message"
                        }
                        key={msgIdx}
                      >
                        <div className="message-inner">
                          <div className="d-flex align-items-center mb-3">
                            <img
                              src={`http://localhost:5001/uploads/profiles/${sender.picture}`}
                              style={{
                                width: 35,
                                height: 35,
                                objectFit: "cover",
                                borderRadius: "50%",
                                marginRight: 10,
                              }}
                              alt="."
                            />
                            <p className="message-sender">
                              {sender._id === user?._id ? "You" : sender.name}
                            </p>
                          </div>
                          <p className="message-content">{content}</p>
                          {file && (
                            <a
                              href={`http://localhost:5001/uploads/documents/${encodeURIComponent(file)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-file-pdf"></i> {file}
                            </a>
                          )}
                          <p className="message-timestamp-left">{time}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ))}
            <div ref={messageEndRef} />
          </div>
          {file && (
            <div className="file-preview">
              <strong>File Selected:</strong> {file.name}
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={1}>
                <Form.Group>
                  <Form.Control
                    type="file"
                    id="fileUpload"
                    name="pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={!user || user.blocked === true}
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => document.getElementById('fileUpload').click()}
                    disabled={!user || user.blocked === true}
                  >
                    <i className="fas fa-paperclip"></i>
                  </Button>
                </Form.Group>
              </Col>
              <Col md={10}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Your message"
                    disabled={!user || user.blocked === true}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Button
                  variant="primary"
                  type="submit"
                  style={{ width: "100%", backgroundColor: "orange" }}
                  disabled={!user || user.blocked === true}
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </>
  );
}

export default MessageForm;
