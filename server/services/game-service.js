// Api for generating Starting and Ending Station
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


// Submitted route validation
export const validateRoute = (game, segmentIds, allSegments) => {
  if (!Array.isArray(segmentIds) || segmentIds.length === 0) {
    return { valid: false, reason: 'No segments selected' };
  }

  const uniqueSegmentIds = new Set(segmentIds);

  if (uniqueSegmentIds.size !== segmentIds.length) {
    return { valid: false, reason: 'A segment cannot be used more than once' };
  }

  const segmentsById = new Map();

  for (const segment of allSegments) {
    segmentsById.set(segment.id, segment);
  }

  let currentStationId = game.start_station_id;

  for (const segmentId of segmentIds) {
    const segment = segmentsById.get(segmentId);

    if (!segment) {
      return { valid: false, reason: 'Segment does not exist' };
    }

    if (
      segment.station1_id !== currentStationId &&
      segment.station2_id !== currentStationId
    ) {
      return { valid: false, reason: 'Route is not continuous' };
    }

    if (segment.station1_id === currentStationId) {
      currentStationId = segment.station2_id;
    } else {
      currentStationId = segment.station1_id;
    }
  }

  if (currentStationId !== game.destination_station_id) {
    return { valid: false, reason: 'Route does not reach destination' };
  }

  return { valid: true };
};