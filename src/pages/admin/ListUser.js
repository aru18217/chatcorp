import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Table, Container, Button, Spinner, Alert } from "react-bootstrap";
import { useGetAllUsersQuery, useBlockUserMutation } from "../../services/appApi";

function ListUser() {
    const me = useSelector((state) => state.user);
    const { data: users, error, isLoading } = useGetAllUsersQuery();
    const [blockUser, { isLoading: saving }] = useBlockUserMutation();
    const [notice, setNotice] = useState(null);

    async function handleBlockToggle(user) {
        const blocked = !user.blocked;
        if (!window.confirm(`${blocked ? "Block" : "Unblock"} ${user.name}?`)) return;
        const res = await blockUser({ userId: user._id, blocked });
        if (res.error) {
            setNotice({ variant: "danger", text: res.error.data?.message || "Could not update the user." });
        } else {
            setNotice({ variant: "success", text: `${user.name} ${blocked ? "blocked" : "unblocked"}.` });
        }
    }

    return (
        <Container className="page">
            <div className="page-head">
                <div>
                    <h1 className="h3 mb-1">Users</h1>
                    <p className="text-muted mb-0">Blocked users can still read messages but cannot send new ones.</p>
                </div>
            </div>

            {notice && <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)}>{notice.text}</Alert>}
            {error && <Alert variant="danger">Error loading users. {error.data?.message || ""}</Alert>}

            <div className="table-card">
                {isLoading ? (
                    <div className="text-center py-5"><Spinner animation="border" /></div>
                ) : (
                    <Table hover responsive className="mb-0 align-middle">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user) => (
                                <tr key={user._id}>
                                    <td className="fw-semibold">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td className="text-capitalize">{user.role}</td>
                                    <td>
                                        {user.blocked ? <span className="pill pill--danger">Blocked</span> : <span className="pill pill--ok">Active</span>}
                                    </td>
                                    <td className="text-end">
                                        {user._id === me?._id ? (
                                            <span className="text-muted small">You</span>
                                        ) : (
                                            <Button size="sm" disabled={saving} onClick={() => handleBlockToggle(user)} variant={user.blocked ? "outline-success" : "outline-danger"}>
                                                {user.blocked ? "Unblock" : "Block"}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </Container>
    );
}

export default ListUser;
