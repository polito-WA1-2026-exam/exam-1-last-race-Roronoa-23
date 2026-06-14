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