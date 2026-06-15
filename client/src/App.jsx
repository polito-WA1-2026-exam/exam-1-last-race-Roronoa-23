import { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Spinner, Table, Alert } from 'react-bootstrap';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import * as API from './API';
import Login from './login';

function HomePage({ user }) {
  return (
    <Container className="mt-4">
      <h1>Last Race</h1>

      {!user ? (
        <>
          <p>
            Plan your route, face random events, and try to finish the race with
            the highest number of coins.
          </p>
          <p>
            Anonymous users can read the instructions, but must login to play.
          </p>
        </>
      ) : (
        <>
          <p>Welcome back, {user.username}.</p>
          <p>Use the navigation bar to start a new game or check the ranking.</p>
        </>
      )}
    </Container>
  );
}

function PlayPage() {
  return (
    <Container className="mt-4">
      <h1>Play</h1>
      <p>Here the user will start and play a new game.</p>
    </Container>
  );
}

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    API.getRanking()
      .then((ranking) => setRanking(ranking))
      .catch((err) => setErrorMessage(err.error || 'Ranking loading failed'));
  }, []);

  return (
    <Container className="mt-4">
      <h1>Ranking</h1>

      {errorMessage && (
        <Alert variant="danger">{errorMessage}</Alert>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Position</th>
            <th>User</th>
            <th>Best score</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((row, index) => (
            <tr key={row.user_id}>
              <td>{index + 1}</td>
              <td>{row.username}</td>
              <td>{row.best_score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
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
          {user && (
            <>
              <Nav.Link as={Link} to="/play">
                Play
              </Nav.Link>
              <Nav.Link as={Link} to="/ranking">
                Ranking
              </Nav.Link>
            </>
          )}

          {user ? (
            <>
              <Navbar.Text className="me-3 ms-3">
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
        <Route path="/play" element={<PlayPage />} />
        <Route path="/ranking" element={<RankingPage />} />   
      </Routes>
    </BrowserRouter>
  );
}

export default App;