import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Navigation from "./components/Navigation";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Profile from "./components/Profile";
import Auth from "./pages/Auth";
import History from "./pages/History";
import ListUser from "./pages/admin/ListUser";
import { AppContext, socket, connectSocket, disconnectSocket } from "./context/appContext";
import { clearSession } from "./features/userSlice";

function App() {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState("");
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [privateMemberMsg, setPrivateMemberMsg] = useState(null);
    const [newMessages, setNewMessages] = useState({});
    const [unlockedRooms, setUnlockedRooms] = useState({});
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    // Connect the socket whenever there is a valid session.
    useEffect(() => {
        if (user?.token) {
            connectSocket(user.token);
        } else {
            disconnectSocket();
            setMessages([]);
            setCurrentRoom("");
            setPrivateMemberMsg(null);
            setUnlockedRooms({});
        }
    }, [user?.token]);

    useEffect(() => {
        const onError = (err) => {
            if (err?.message === "unauthorized") dispatch(clearSession());
        };
        socket.on("connect_error", onError);
        return () => socket.off("connect_error", onError);
    }, [dispatch]);

    const isLoggedIn = Boolean(user?.token);

    return (
        <AppContext.Provider
            value={{ socket, currentRoom, setCurrentRoom, members, setMembers, messages, setMessages, privateMemberMsg, setPrivateMemberMsg, rooms, setRooms, newMessages, setNewMessages, unlockedRooms, setUnlockedRooms }}
        >
            <BrowserRouter>
                <Navigation />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={isLoggedIn ? <Navigate to="/chat" replace /> : <Login />} />
                    <Route path="/signup" element={isLoggedIn ? <Navigate to="/chat" replace /> : <Signup />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
                    <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                    <Route path="/history" element={<RequireAuth admin><History /></RequireAuth>} />
                    <Route path="/admin" element={<RequireAuth admin><ListUser /></RequireAuth>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AppContext.Provider>
    );
}

export default App;
