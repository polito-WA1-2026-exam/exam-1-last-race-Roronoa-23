import { useEffect, useState } from 'react';
import { Alert, Button, Table } from 'react-bootstrap';
import * as API from './API';
import { SetupMap, PlanningMap } from './networkmap';

const eventIcons = import.meta.glob('./assets/events-ic/*', {
  eager: true,
  query: '?url',
  import: 'default'
});

const getEventIcon = (filename) => {
  if (!filename) {
    return null;
  }

  return eventIcons[`./assets/events-ic/${filename}`] || null;
};

function PlayPage() {
  const [game, setGame] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [phase, setPhase] = useState('start');
  const [drawnLinks, setDrawnLinks] = useState([]);
  const [network, setNetwork] = useState(null);

  const handleStartGame = async () => {
    setErrorMessage('');
    setSelectedSegments([]);
    setResult(null);
    setTimeLeft(900);
    setPhase('start');
    setSelectedStationId(null);
    setDrawnLinks([]);
    setNetwork(null);

    try {
      const newGame = await API.createGame();
      const planningData = await API.getPlanning(newGame.id);
      const networkData = await API.getFullNetwork();

      setGame(planningData);
      setNetwork(networkData);
      setPhase('setup');
    } catch (err) {
      setErrorMessage(err.error || 'Game creation failed');
    }
  };

  const handleSelectStation = (stationId) => {
    if (!game || result) {
      return;
    }

    if (selectedStationId === null) {
      setSelectedStationId(stationId);
      setErrorMessage('');
      return;
    }

    if (selectedStationId === stationId) {
      setSelectedStationId(null);
      setErrorMessage('');
      return;
    }

    const realSegment = game.segments.find((segment) => {
      const sameDirection =
        segment.station1_id === selectedStationId &&
        segment.station2_id === stationId;

      const oppositeDirection =
        segment.station1_id === stationId &&
        segment.station2_id === selectedStationId;

      return sameDirection || oppositeDirection;
    });

    if (realSegment) {
      setSelectedSegments((oldSelectedSegments) => [
        ...oldSelectedSegments,
        realSegment.id
      ]);

      setDrawnLinks((oldDrawnLinks) => [
        ...oldDrawnLinks,
        {
          id: realSegment.id,
          station1_id: selectedStationId,
          station2_id: stationId,
          valid: true
        }
      ]);
    } else {
      setSelectedSegments((oldSelectedSegments) => [
        ...oldSelectedSegments,
        -(oldSelectedSegments.length + 1)
      ]);

      setDrawnLinks((oldDrawnLinks) => [
        ...oldDrawnLinks,
        {
          id: -(oldDrawnLinks.length + 1),
          station1_id: selectedStationId,
          station2_id: stationId,
          valid: false
        }
      ]);
    }

    setSelectedStationId(null);
    setErrorMessage('');
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
    if (!game || result || phase !== 'planning') {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmitRoute();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft((oldTimeLeft) => oldTimeLeft - 1);
    }, 100);

    return () => clearTimeout(timerId);
  }, [game, result, timeLeft, phase]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 600);
    const seconds = Math.floor((time % 600) / 10);
    const tenths = time % 10;

    return `${minutes}:${String(seconds).padStart(2, '0')}:${tenths}`;
  };

  const handleStartPlanning = () => {
    setTimeLeft(900);
    setPhase('planning');
  };

  return (
    <main className="game-page play-page">
      {errorMessage && (
        <Alert variant="danger">{errorMessage}</Alert>
      )}

      {phase === 'start' && (
        <section className="start-game-panel">
          <h1 className="start-game-title">Mission Terminal</h1>

          <p className="start-game-subtitle">
            Create a new route and start the Last Race.
          </p>

          <Button className="game-menu-button start-game-button" onClick={handleStartGame}>
            Start new game
          </Button>
        </section>
      )}

      {game && phase === 'setup' && (
        <section className="setup-panel">
          <h1 className="start-game-title">Network Map</h1>

          <p className="start-game-subtitle">
            Study the full network before planning your route.
          </p>

          <p className="start-game-subtitle">
            The Starting station will be green, the destination red.
          </p>

          <div className="network-map-box">
            {network && (
              <SetupMap
                stations={network.stations}
                lines={network.lines}
                lineStations={network.lineStations}
              />
            )}
          </div>

          <Button className="game-menu-button start-game-button" onClick={handleStartPlanning}>
            Start planning
          </Button>
        </section>
      )}

      {game && phase === 'planning' && (
        <section className="planning-panel">
          <div className="game-timer">
            <span className="timer-icon">◷</span>
            <span>{formatTime(timeLeft)}</span>
          </div>

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

          <div className="network-map-box planning-map">
            <PlanningMap
              stations={game.stations}
              drawnLinks={drawnLinks}
              selectedStationId={selectedStationId}
              startStationId={game.game.startStation.id}
              destinationStationId={game.game.destinationStation.id}
              onStationClick={handleSelectStation}
            />
          </div>

          <h4 className="mt-4">Trace your route</h4>

          <p>
            Click the connected stations on the map to build your route.
          </p>

          <h4 className="mt-4">Selected route</h4>

          {selectedSegments.length === 0 ? (
            <p>No segment selected yet.</p>
          ) : (
            <p>{selectedSegments.join(' → ')}</p>
          )}

          <div className="d-flex gap-2 mt-2">
            <Button
              variant="warning"
              onClick={() => {
                setSelectedSegments((oldSelectedSegments) => oldSelectedSegments.slice(0, -1));
                setDrawnLinks((oldDrawnLinks) => oldDrawnLinks.slice(0, -1));
                setSelectedStationId(null);
              }}
              disabled={selectedSegments.length === 0 || result !== null}
            >
              Undo last segment
            </Button>

            <Button
              variant="danger"
              onClick={() => {
                setSelectedSegments([]);
                setSelectedStationId(null);
                setDrawnLinks([]);
              }}
              disabled={selectedSegments.length === 0 || result !== null}
            >
              Clear route
            </Button>
          </div>

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

                          <td>
                            <div className="event-cell">
                              {getEventIcon(step.event_icon_filename) && (
                                <img
                                  src={getEventIcon(step.event_icon_filename)}
                                  alt=""
                                  className="event-icon"
                                />
                              )}

                              <span>{step.event_description}</span>
                            </div>
                          </td>

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
        </section>
      )}
    </main>
  );
}

export default PlayPage;