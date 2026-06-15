import db from '../db.js';

export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT u.id AS user_id,
        u.username,
        MAX(g.final_score) AS best_score
        FROM games g
        JOIN users u ON g.user_id = u.id
        WHERE g.status = 'completed'
        GROUP BY u.id, u.username
        ORDER BY best_score DESC, u.username ASC`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const createGame = (userId, startStationId, destinationStationId) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO games (user_id,
        start_station_id,
        destination_station_id,
        initial_coins,
        final_score,
        status,
        created_at,
        completed_at)VALUES (?, ?, ?, 20, NULL, 'planning', datetime('now'), NULL)`;

    db.run(sql, [userId, startStationId, destinationStationId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

export const getGameByIdAndUser = (gameId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT g.id,
        g.user_id,
        g.start_station_id,
        start.name AS start_station_name,
        g.destination_station_id,
        dest.name AS destination_station_name,
        g.initial_coins,
        g.final_score,
        g.status,
        g.created_at,
        g.completed_at
      FROM games g
      JOIN stations start ON g.start_station_id = start.id
      JOIN stations dest ON g.destination_station_id = dest.id
      WHERE g.id = ? AND g.user_id = ?`;

    db.get(sql, [gameId, userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};