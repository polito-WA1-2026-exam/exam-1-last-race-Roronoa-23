import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('last-race.sqlite', (err) => {
  if (err) {
    throw err;
  }

  console.log('Connected to the SQLite database.');
});

export default db;

/* This file opens a single connection to the SQLite database, so that other server module wont need to open a new connection. */