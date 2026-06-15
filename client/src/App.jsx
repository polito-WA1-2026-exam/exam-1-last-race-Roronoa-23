import { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Spinner } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import * as API from './API';
import Login from './login';

function HomePage() {
  return (
    <Container className="mt-4">
      <h1>Last Race</h1>
      <p>
        Welcome to Last Race. Login to start planning your route and play the game.
      </p>
    </Container>
  );
}

function NavigationBar({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Last Race
        </Navbar.Brand>

        <Nav className="ms-auto">
          {user ? (
            <>
              <Navbar.Text className="me-3">
                Logged in as {user.username}
              </Navbar.Text>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="outline-light" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    API.getCurrentSession()
      .then((user) => setUser(user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await API.logOut();
    setUser(null);
  };

  if (user === undefined) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <BrowserRouter>
      <NavigationBar user={user} handleLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;