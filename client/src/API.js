const SERVER_URL = 'http://localhost:3001/api';

async function getJson(httpResponse) {
  const responseBody = await httpResponse.json();

  if (httpResponse.ok) {
    return responseBody;
  }

  throw responseBody;
}

export async function logIn(credentials) {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });

  return getJson(response);
}

export async function getCurrentSession() {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    credentials: 'include'
  });

  return getJson(response);
}

export async function logOut() {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
}

export async function getRanking() {
  const response = await fetch(`${SERVER_URL}/ranking`, {
    credentials: 'include'
  });

  return getJson(response);
}

export async function createGame() {
  const response = await fetch(`${SERVER_URL}/games`, {
    method: 'POST',
    credentials: 'include'
  });

  return getJson(response);
}

export async function getPlanning(gameId) {
  const response = await fetch(`${SERVER_URL}/games/${gameId}/planning`, {
    credentials: 'include'
  });

  return getJson(response);
}

export async function submitRoute(gameId, segmentIds) {
  const response = await fetch(`${SERVER_URL}/games/${gameId}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ segmentIds })
  });

  return getJson(response);
}

export async function getGameResult(gameId) {
  const response = await fetch(`${SERVER_URL}/games/${gameId}/result`, {
    credentials: 'include'
  });

  return getJson(response);
}