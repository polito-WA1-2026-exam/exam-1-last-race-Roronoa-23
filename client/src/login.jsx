import { useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as API from './API';

function Login({ setUser }) {
  const [username, setUsername] = useState('Ratchet');
  const [password, setPassword] = useState('lombax');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const user = await API.logIn({ username, password });
      setUser(user);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.error || err.message || 'Login failed');
    }
  };

  return (
    <Container className="mt-4">
      <Card style={{ maxWidth: '30rem' }}>
        <Card.Body>
          <Card.Title>Login</Card.Title>

          {errorMessage && (
            <Alert variant="danger">{errorMessage}</Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Form.Group>

            <Button type="submit">Login</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;