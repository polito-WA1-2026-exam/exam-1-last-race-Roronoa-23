import { useEffect, useState } from 'react';
import { Alert, Container, Table } from 'react-bootstrap';
import * as API from './API';

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

export default RankingPage;