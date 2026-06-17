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

export const getEvents = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, description, effect FROM events ORDER BY id `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const insertGameSteps = (gameId, steps) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO game_steps (
        game_id,
        step_order,
        segment_id,
        from_station_id,
        to_station_id,
        event_id,
        coins_after_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.serialize(() => {
      const insertNextStep = (index) => {
        if (index === steps.length) {
          resolve();
          return;
        }

        const step = steps[index];

        db.run(
          sql,
          [
            gameId,
            index + 1,
            step.segmentId,
            step.fromStationId,
            step.toStationId,
            step.eventId,
            step.coinsAfterStep
          ],
          (err) => {
            if (err) {
              reject(err);
            } else {
              insertNextStep(index + 1);
            }
          }
        );
      };

      insertNextStep(0);
    });
  });
};

export const completeGame = (gameId, finalScore) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE games SET final_score = ?,status = 'completed',completed_at = datetime('now') WHERE id = ?`;
    db.run(sql, [finalScore, gameId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// after game
export const getCompletedGameByIdAndUser = (gameId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        g.id,
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
      WHERE g.id = ? AND g.user_id = ? AND g.status = 'completed'
    `;

    db.get(sql, [gameId, userId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export function getGameSteps(gameId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        gs.step_order,
        gs.segment_id,
        gs.from_station_id,
        fs.name AS from_station_name,
        gs.to_station_id,
        ts.name AS to_station_name,
        gs.event_id,
        e.description AS event_description,
        e.effect,
        e.icon_filename AS event_icon_filename,
        gs.coins_after_step
      FROM game_steps gs
      JOIN stations fs ON gs.from_station_id = fs.id
      JOIN stations ts ON gs.to_station_id = ts.id
      JOIN events e ON gs.event_id = e.id
      WHERE gs.game_id = ?
      ORDER BY gs.step_order ASC
    `;

    db.all(sql, [gameId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};