import { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Spinner, Table, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import * as API from './API';
import Login from './login';
import HomePage from './homepage';
import RankingPage from './rankingpage';
import PlayPage from './playpage';
import './App.css';


function NavigationBar({ user, handleLogout }) {
  const navigate = useNavigate();

  return (
    <Navbar className="game-navbar" data-bs-theme="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          LAST RACE
        </Navbar.Brand>

        <Nav className="ms-auto">
          {user && (
            <>
              <Nav.Link as={Link} to="/play" className="game-menu-link">
                Play
              </Nav.Link>
              <Nav.Link as={Link} to="/ranking" className="game-menu-link">
                Ranking
              </Nav.Link>
            </>
          )}

          {user ? (
            <>
              <Navbar.Text className="game-user-label">
                Logged in as <span>{user.username}</span>
              </Navbar.Text>
              <Button className="game-menu-button" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button className="game-menu-button" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

function ProtectedRoute({ user, children }) {
  if (!user) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          You must login to access this page.
        </Alert>
      </Container>
    );
  }

  return children;
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
      <div className="app-shell">
      <NavigationBar user={user} handleLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
                <Route
          path="/play"
          element={
            <ProtectedRoute user={user}>
              <PlayPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ranking"
          element={
            <ProtectedRoute user={user}>
              <RankingPage />
            </ProtectedRoute>
          }
        /> 
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;