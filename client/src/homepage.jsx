import { Container } from 'react-bootstrap';

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

export default HomePage;