import { Container } from 'react-bootstrap';

function HomePage({ user }) {
  return (
    <Container className="mt-4">
      <h1 className="home-title">LAST RACE</h1>

      {!user ? (
        <>
          <div className="home-instructions">
            <p>
              Plan your route, face random events, and try to finish the race with
              the highest number of coins.
            </p>

            <p>
              Anonymous users can read the instructions, but must login to play.
            </p>
          </div>
        </>
      ) : (
        <>
          <p>Welcome back, <span className="username-highlight">{user.username}</span>.</p>
          <p>Use the navigation bar to start a new game or check the ranking.</p>
        </>
      )}
    </Container>
  );
}

export default HomePage;