function calculateStationPositions(stations) {
  const width = 900;
  const height = 420;
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = 330;
  const radiusY = 150;

  const stationPositions = new Map();

  stations.forEach((station, index) => {
    const angle = (2 * Math.PI * index) / stations.length - Math.PI / 2;

    stationPositions.set(station.id, {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle)
    });
  });

  return { width, height, stationPositions };
}

function SetupMap({ stations, lines, lineStations }) {
  const { width, height, stationPositions } = calculateStationPositions(stations);

  return (
    <svg
      className="network-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Full network map"
    >
      <g className="network-segments">
        {lines.map((line) => {
          const stationsOnLine = lineStations
            .filter((lineStation) => lineStation.line_id === line.id)
            .sort((a, b) => a.position - b.position);

          return stationsOnLine.slice(0, -1).map((lineStation, index) => {
            const nextLineStation = stationsOnLine[index + 1];

            const start = stationPositions.get(lineStation.station_id);
            const end = stationPositions.get(nextLineStation.station_id);

            if (!start || !end) {
              return null;
            }

            return (
              <line
                key={`${line.id}-${lineStation.station_id}-${nextLineStation.station_id}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="network-segment setup-line"
                style={{ stroke: line.color }}
              />
            );
          });
        })}
      </g>

      <StationLayer
        stations={stations}
        stationPositions={stationPositions}
      />
    </svg>
  );
}

function PlanningMap({
  stations,
  drawnLinks,
  selectedStationId,
  startStationId,
  destinationStationId,
  onStationClick
}) {
  const { width, height, stationPositions } = calculateStationPositions(stations);

  return (
    <svg
      className="network-map"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Planning network map"
    >
        <g className="network-segments">
        {drawnLinks.map((link, index) => {
            const start = stationPositions.get(link.station1_id);
            const end = stationPositions.get(link.station2_id);

            if (!start || !end) {
            return null;
            }

            return (
            <line
                key={`${link.id}-${index}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className={link.valid ? 'network-segment selected' : 'network-segment invalid'}
            />
            );
        })}
        </g>

      <StationLayer
        stations={stations}
        stationPositions={stationPositions}
        selectedStationId={selectedStationId}
        startStationId={startStationId}
        destinationStationId={destinationStationId}
        onStationClick={onStationClick}
      />
    </svg>
  );
}

function StationLayer({
  stations,
  stationPositions,
  selectedStationId = null,
  startStationId = null,
  destinationStationId = null,
  onStationClick = null
}) {
  return (
    <g className="network-stations">
      {stations.map((station) => {
        const position = stationPositions.get(station.id);

        if (!position) {
          return null;
        }

        const isStart = station.id === startStationId;
        const isDestination = station.id === destinationStationId;
        const isSelectedStation = station.id === selectedStationId;
        const isClickable = onStationClick !== null;

        let stationClassName = 'network-station-dot';

        if (isStart) {
          stationClassName += ' start';
        }

        if (isDestination) {
          stationClassName += ' destination';
        }

        if (isSelectedStation) {
          stationClassName += ' selected-pending';
        }

        if (isClickable) {
          stationClassName += ' clickable';
        }

        return (
          <g
            key={station.id}
            className={isClickable ? 'network-station clickable' : 'network-station'}
            onClick={isClickable ? () => onStationClick(station.id) : undefined}
          >
            <circle
              cx={position.x}
              cy={position.y}
              r="10"
              className={stationClassName}
            />

            <text
              x={position.x}
              y={position.y - 18}
              textAnchor="middle"
              className="network-station-label"
            >
              {station.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export { SetupMap, PlanningMap };