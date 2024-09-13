import React from "react";
import { useGetAllUsersQuery, useBlockUserMutation } from "../../services/appApi";
import { Table, Container, Button } from "react-bootstrap";
import { useEffect } from "react";

function ListUser() {
    const { data: users, error, isLoading, refetch } = useGetAllUsersQuery();
    const [blockUser] = useBlockUserMutation();

    useEffect(()=>{
        
    },[])

    const handleBlockToggle = async (user) => {
        try {
            const updatedStatus = !user.blocked;
            console.log(updatedStatus)
            
            const userId = user._id
            console.log(userId)
            await blockUser({ userId, blocked: updatedStatus });
            alert(`User ${updatedStatus ? 'blocked' : 'unblocked'} successfully`);
            refetch();
        } catch (err) {
            alert(`Error updating user status: ${err.message}`);
        }
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading users: {error.message}</p>;

    return (
        <Container>
            <h2 className="my-4">List of Users</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button 
                                    onClick={() => handleBlockToggle(user)} 
                                    variant={user.blocked ? "success" : "danger"}
                                >
                                    {user.blocked ? "Unblock" : "Block"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default ListUser;
