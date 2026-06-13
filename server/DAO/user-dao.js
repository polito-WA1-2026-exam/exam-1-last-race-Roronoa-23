import db from '../db.js';

export const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, username, password_hash FROM users WHERE username = ?`;

    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, username FROM users WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};