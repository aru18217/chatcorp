import React, { useEffect, useState } from "react";
import { Table, Container, Form, Spinner, Alert } from "react-bootstrap";
import { useGetChatHistoryQuery } from "../services/appApi";

function History() {
    const [name, setName] = useState("");
    const [debounced, setDebounced] = useState("");
    const { data: history, isFetching, error } = useGetChatHistoryQuery(debounced);

    // Wait until the admin stops typing before filtering.
    useEffect(() => {
        const t = setTimeout(() => setDebounced(name.trim()), 350);
        return () => clearTimeout(t);
    }, [name]);

    return (
        <Container className="page">
            <div className="page-head">
                <div>
                    <h1 className="h3 mb-1">Chat history</h1>
                    <p className="text-muted mb-0">Who sent messages and when. Message content stays encrypted and is not shown here.</p>
                </div>
                <Form.Control className="page-search" type="search" placeholder="Filter by sender name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Filter by sender name" />
            </div>

            {error && <Alert variant="danger">Could not load history. {error.data?.message || ""}</Alert>}

            <div className="table-card">
                {isFetching && !history ? (
                    <div className="text-center py-5"><Spinner animation="border" /></div>
                ) : (
                    <Table hover responsive className="mb-0">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>From</th>
                                <th>Room</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history?.length ? (
                                history.map((m, i) => (
                                    <tr key={i}>
                                        <td className="text-muted">{i + 1}</td>
                                        <td className="fw-semibold">{m.from?.name || "Unknown"}</td>
                                        <td>{/^\S+-\S+$/.test(m.to || "") ? "Direct message" : m.to}</td>
                                        <td>{m.date}</td>
                                        <td>{m.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-4">No chat history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </div>
        </Container>
    );
}

export default History;
