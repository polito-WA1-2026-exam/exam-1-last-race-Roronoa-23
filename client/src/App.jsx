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
  const [game, setGame] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);

  const handleStartGame = async () => {
    setErrorMessage('');
    setSelectedSegments([]);
    setResult(null);
    setTimeLeft(90);

    try {
      const newGame = await API.createGame();
      const planningData = await API.getPlanning(newGame.id);
      setGame(planningData);
    } catch (err) {
      setErrorMessage(err.error || 'Game creation failed');
    }
  };

  const handleSelectSegment = (segmentId) => {
    setSelectedSegments((oldSelectedSegments) => {
      if (oldSelectedSegments.includes(segmentId)) {
        return oldSelectedSegments;
      }

      return [...oldSelectedSegments, segmentId];
    });
  };
  const handleSubmitRoute = async () => {
      setErrorMessage('');

      try {
    await API.submitRoute(
      game.game.id,
      selectedSegments
    );
    const savedResult = await API.getGameResult(game.game.id);
    setResult(savedResult);
  } catch (err) {
    setErrorMessage(err.error || 'Route submission failed');
  }
};

    useEffect(() => {
      if (!game || result) {
        return;
      }

      if (timeLeft === 0) {
        handleSubmitRoute();
        return;
      }

      const timerId = setTimeout(() => {
        setTimeLeft((oldTimeLeft) => oldTimeLeft - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    }, [game, result, timeLeft]);

  return (
    <Container className="mt-4">
      <h1>Play</h1>

      {errorMessage && (
        <Alert variant="danger">{errorMessage}</Alert>
      )}

      <Button onClick={handleStartGame}>
        Start new game
      </Button>

      {game && (
        <div className="mt-4">
          <h3>Planning phase</h3>

          <p>
            <strong>Start station:</strong> {game.game.startStation.name}
          </p>

          <p>
            <strong>Destination station:</strong> {game.game.destinationStation.name}
          </p>

          <p>
            <strong>Initial coins:</strong> {game.game.initialCoins}
          </p>

          <p>
            <strong>Time left:</strong> {timeLeft} seconds
          </p>

          <h4 className="mt-4">Available segments</h4>

          <div className="d-flex flex-column gap-2">
            {game.segments.map((segment) => (
              <Button
                key={segment.id}
                variant={selectedSegments.includes(segment.id) ? 'success' : 'outline-primary'}
                onClick={() => handleSelectSegment(segment.id)}
                disabled={result !== null}
              >
                #{segment.id}: {segment.station1_name} → {segment.station2_name}
              </Button>
            ))}
          </div>

          <h4 className="mt-4">Selected route</h4>

          <Button
          className="mt-2"
          variant="success"
          onClick={handleSubmitRoute}
          disabled={selectedSegments.length === 0 || result !== null}
        >
          Submit route
        </Button>


            {result && (
              <div className="mt-4">
                <h3>Result</h3>

                <Alert variant="success">
                  Game completed!
                </Alert>

                <p>
                  <strong>Final score:</strong> {result.game.finalScore}
                </p>

                {result.steps.length > 0 && (
                  <>
                    <h4>Execution steps</h4>

                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Step</th>
                          <th>Segment</th>
                          <th>Event</th>
                          <th>Effect</th>
                          <th>Coins after step</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.steps.map((step) => (
                          <tr key={step.step_order}>
                            <td>{step.step_order}</td>
                            <td>
                              {step.from_station_name} → {step.to_station_name}
                            </td>
                            <td>{step.event_description}</td>
                            <td>{step.effect}</td>
                            <td>{step.coins_after_step}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}

                {result.steps.length === 0 && (
                  <Alert variant="warning">
                    Invalid or incomplete route. Execution skipped.
                  </Alert>
                )}
              </div>
            )}

          {selectedSegments.length === 0 ? (
            <p>No segment selected yet.</p>
          ) : (
            <p>{selectedSegments.join(' → ')}</p>
          )}
        </div>
      )}
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
      <NavigationBar user={user} handleLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<HomePage />} />
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
    </BrowserRouter>
  );
}

export default App;