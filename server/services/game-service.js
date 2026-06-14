const buildAdjacencyList = (segments) => {
  const adjacency = {};

  for (const segment of segments) {
    const station1Id = segment.station1_id;
    const station2Id = segment.station2_id;

    if (!adjacency[station1Id]) {
      adjacency[station1Id] = [];
    }

    if (!adjacency[station2Id]) {
      adjacency[station2Id] = [];
    }

    adjacency[station1Id].push(station2Id);
    adjacency[station2Id].push(station1Id);
  }

  return adjacency;
};

const calculateDistances = (startStationId, adjacency) => {
  const distances = {};
  const queue = [];

  distances[startStationId] = 0;
  queue.push(startStationId);

  while (queue.length > 0) {
    const currentStationId = queue.shift();

    for (const neighborId of adjacency[currentStationId] || []) {
      if (distances[neighborId] === undefined) {
        distances[neighborId] = distances[currentStationId] + 1;
        queue.push(neighborId);
      }
    }
  }

  return distances;
};

export const selectStartAndDestination = (stations, segments) => {
  const adjacency = buildAdjacencyList(segments);

  const randomStartIndex = Math.floor(Math.random() * stations.length);
  const startStation = stations[randomStartIndex];

  const distances = calculateDistances(startStation.id, adjacency);

  const validDestinations = stations.filter((station) => {
    return station.id !== startStation.id && distances[station.id] >= 3;
  });

  if (validDestinations.length === 0) {
    throw new Error('No valid destination found');
  }

  const randomDestinationIndex = Math.floor(Math.random() * validDestinations.length);
  const destinationStation = validDestinations[randomDestinationIndex];

  return {
    startStation,
    destinationStation
  };
};