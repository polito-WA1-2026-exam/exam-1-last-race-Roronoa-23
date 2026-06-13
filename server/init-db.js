
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const db = new sqlite3.Database('last-race.sqlite');

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON'); /* it activates the control on foreign keys */

    /*since with this script we initialize the database, it will drop any existing table */
    db.run('DROP TABLE IF EXISTS game_steps');
    db.run('DROP TABLE IF EXISTS games');
    db.run('DROP TABLE IF EXISTS events');
    db.run('DROP TABLE IF EXISTS line_segments');
    db.run('DROP TABLE IF EXISTS segments');
    db.run('DROP TABLE IF EXISTS line_stations');
    db.run('DROP TABLE IF EXISTS lines');
    db.run('DROP TABLE IF EXISTS stations');
    db.run('DROP TABLE IF EXISTS users');

    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
        )`);

    db.run(`CREATE TABLE stations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
        )`);

    db.run(`CREATE TABLE lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL
        )`);

    db.run(`CREATE TABLE line_stations (
        line_id INTEGER NOT NULL,
        station_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        PRIMARY KEY (line_id, station_id),
        UNIQUE (line_id, position),
        FOREIGN KEY (line_id) REFERENCES lines(id),
        FOREIGN KEY (station_id) REFERENCES stations(id)
        )`);

    db.run(`CREATE TABLE segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station1_id INTEGER NOT NULL,
        station2_id INTEGER NOT NULL,
        UNIQUE (station1_id, station2_id),
        FOREIGN KEY (station1_id) REFERENCES stations(id),
        FOREIGN KEY (station2_id) REFERENCES stations(id),
        CHECK (station1_id <> station2_id)
        )`);

    db.run(`CREATE TABLE line_segments (
        line_id INTEGER NOT NULL,
        segment_id INTEGER NOT NULL,
        PRIMARY KEY (line_id, segment_id),
        FOREIGN KEY (line_id) REFERENCES lines(id),
        FOREIGN KEY (segment_id) REFERENCES segments(id)
        )`);

    db.run(` CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        effect INTEGER NOT NULL,
        CHECK (effect >= -4 AND effect <= 4)
        )`);

    db.run(`CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        start_station_id INTEGER NOT NULL,
        destination_station_id INTEGER NOT NULL,
        initial_coins INTEGER NOT NULL DEFAULT 20,
        final_score INTEGER,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (start_station_id) REFERENCES stations(id),
        FOREIGN KEY (destination_station_id) REFERENCES stations(id),
        CHECK (status IN ('planning', 'completed', 'failed'))
        )`);

    db.run(`CREATE TABLE game_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        step_order INTEGER NOT NULL,
        segment_id INTEGER NOT NULL,
        from_station_id INTEGER NOT NULL,
        to_station_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        coins_after_step INTEGER NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games(id),
        FOREIGN KEY (segment_id) REFERENCES segments(id),
        FOREIGN KEY (from_station_id) REFERENCES stations(id),
        FOREIGN KEY (to_station_id) REFERENCES stations(id),
        FOREIGN KEY (event_id) REFERENCES events(id),
        UNIQUE (game_id, step_order)
        )`);
    });
    db.close();