import db from "./db.js";

export const getStations = () =>{
    return new Promise((resolve, reject)=>{
        const sql = 'SELECT id, name FROM stations ORDER BY id';

        db.all(sql, [], (err,rows)=>{
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const getLines = () =>{
    return new Promise((resolve,reject)=>{
        const sql = 'SELECT id,name,color FROM lines ORDER BY id';

        db.all(sql,[], (err, rows)=>{
            if(err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

export const getSegments = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        s.id,
        s.station1_id,
        st1.name AS station1_name,
        s.station2_id,
        st2.name AS station2_name
      FROM segments s
      JOIN stations st1 ON s.station1_id = st1.id
      JOIN stations st2 ON s.station2_id = st2.id
      ORDER BY s.id
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const getLineStations = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        l.id AS line_id,
        l.name AS line_name,
        l.color,
        s.id AS station_id,
        s.name AS station_name,
        ls.position
      FROM line_stations ls
      JOIN lines l ON ls.line_id = l.id
      JOIN stations s ON ls.station_id = s.id
      ORDER BY l.id, ls.position
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};