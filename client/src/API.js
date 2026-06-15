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