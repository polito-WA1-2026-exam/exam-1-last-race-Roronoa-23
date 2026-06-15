import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
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
    <main className="game-page login-page">
      <section className="login-panel">
        <h1 className="login-title">ACCESS TERMINAL</h1>

        <p className="login-subtitle">
          Insert your pilot credentials to enter the race.
        </p>

        {errorMessage && (
          <Alert variant="danger">{errorMessage}</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              className="game-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              className="game-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Form.Group>

          <Button type="submit" className="game-menu-button login-submit">
            Login
          </Button>
        </Form>
      </section>
    </main>
  );
}

export default Login;