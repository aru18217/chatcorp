import React, { useState } from 'react';
import { Table, Container, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useGetChatHistoryQuery } from '../services/appApi';

function History() {
    const [name, setName] = useState('');
    const { data: history, isLoading, error, refetch } = useGetChatHistoryQuery(name);

    const handleFilter = (e) => {
        e.preventDefault();
        refetch();
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">All Users' Chat History</h1>
            <Form onSubmit={handleFilter} className="mb-4">
                <Row className="justify-content-center">
                    <Col xs={12} md={6}>
                        <Form.Group controlId="formBasicName" className="mb-2">
                            <Form.Label>Filter by Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs="auto">
                        {/* <Button variant="primary" type="submit" className="mt-4">
                            Filter
                        </Button> */}
                    </Col>
                </Row>
            </Form>

            {isLoading && <div className="d-flex justify-content-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger" className="text-center">Error: {error.message}</Alert>}

            {!isLoading && !error && (
                <Table striped bordered hover responsive className="mt-4">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>From</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history && history.length > 0 ? (
                            history.map((message, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{message.from?.name}</td>
                                    <td>{message.date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">
                                    No chat history available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default History;
