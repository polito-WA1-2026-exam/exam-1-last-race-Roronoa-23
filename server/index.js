// imports
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import * as networkDao from './DAO/network-dao.js';
import * as usersDao from './DAO/user-dao.js';
import * as gamesDao from './DAO/games-dao.js';
import * as gameService from './services/game-service.js';

// init express
const app = express();
const port = 3001;
app.use(express.json());

app.use(session({
  secret: 'last-race-secret',
  resave: false,
  saveUninitialized: false
}));

// Passport config
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await usersDao.getUserByUsername(username);

    if (!user) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    return done(null, {
      id: user.id,
      username: user.username
    });
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersDao.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});


app.use(passport.initialize());
app.use(passport.session());

// Protection for APIs (middleware)
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: 'Not authenticated' });
};

// Session APIs
app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ error: info.message });
    }

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.json({
        id: req.user.id,
        username: req.user.username
      });
    });
  })(req, res, next);
});

app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      username: req.user.username
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.delete('/api/sessions/current', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }

    res.status(204).end();
  });
});

// GET Network
app.get('/api/stations', isLoggedIn, async (req, res) => {
  try {
    const stations = await networkDao.getStations();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/lines',isLoggedIn, async (req, res) => {
  try {
    const lines = await networkDao.getLines();
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/segments',isLoggedIn, async (req, res) => {
  try {
    const segments = await networkDao.getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/line-stations',isLoggedIn, async (req, res) => {
  try {
    const lineStations = await networkDao.getLineStations();
    res.json(lineStations);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/network/full', isLoggedIn, async (req, res) => {
  try {
    const stations = await networkDao.getStations();
    const lines = await networkDao.getLines();
    const segments = await networkDao.getSegments();
    const lineStations = await networkDao.getLineStations();

    res.json({
      stations: stations,
      lines: lines,
      segments: segments,
      lineStations: lineStations
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

//Ranking api
app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await gamesDao.getRanking();
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Api for creating a new game
app.post('/api/games', isLoggedIn, async (req, res) => {
  try {
    const stations = await networkDao.getStations();
    const segments = await networkDao.getSegments();

    const { startStation, destinationStation } = gameService.selectStartAndDestination(stations,segments);

    const gameId = await gamesDao.createGame(
      req.user.id,
      startStation.id,
      destinationStation.id);

    res.status(201).json({
      id: gameId,
      startStation,
      destinationStation,
      initialCoins: 20,
      status: 'planning'});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Game creation failed' });
  }
});



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});